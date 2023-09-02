import "reflect-metadata";
import dotenv from "dotenv";
import express, { Express, json, urlencoded } from "express";
import { createServer } from "http";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { DatabaseService } from "./DAO/DatabaseService";
import UserResolver from "./graphql/resolvers/UserResolver";
import HelloResolver from "./graphql/resolvers/HelloResolver";
import { buildSchema } from "type-graphql";
import logError from "./middleware/errorLogger";
import MessageResolver from "./graphql/resolvers/MessageResolver";
import { isJwtTokenValid } from "./utils/jwt";
import { UserDao } from "./DAO/UserDao";
import ChatReportResolver from "./graphql/resolvers/ChatReportResolver";
import BlockUserResolver from "./graphql/resolvers/BlockUserResolver";
import User, { EUserRole } from "./entities/user/User";
import Admin from "./entities/user/Admin";
import AdminResolver from "./graphql/resolvers/AdminResolver";
import { RedisPubSub } from "graphql-redis-subscriptions";
import depthLimit from "graphql-depth-limit";
import * as Redis from "ioredis";
import TransactionResolver from "./graphql/resolvers/TransactionResolver";
import TherapistResolver from "./graphql/resolvers/TherapistResolver";
import AppointmentRatingResolver from "./graphql/resolvers/AppointmentRatingResolver";
import NotificationResolver from "./graphql/resolvers/NotificationResolver";
import { graphqlAuthorizationChecker } from "./middleware/checkAuth";
import AppointmentResolver from "./graphql/resolvers/AppointmentResolver";

async function loadEnvironmentVariables() {
	const envPath = path.join(__dirname, ".env.local");
	try {
		const result = dotenv.config({
			path: envPath,
		});

		if (result.error) {
			throw result.error;
		}

		console.log(`Loaded environment variables from ${envPath}`);
	} catch (err) {
		console.error(err);
	}
}

function applyMiddleware(app: Express) {
	app.use(json());
	app.use(urlencoded({ extended: false }));

	if (process.env.NODE_ENV === "development") {
		app.use(morgan("dev"));
	}

	if (process.env.NODE_ENV === "production") {
		app.use(helmet());
	}

	app.use(logError);

	app.use(
		cors({
			origin: process.env.CLIENT_SITE_DOMAIN_NAME,
		})
	);
}

async function establishConnectionToDatabase() {
	const databaseConnection = await DatabaseService.getConnection();
	return databaseConnection;
}

export async function bootstrap() {
	// load environment variables if on development mode
	if (process.env.NODE_ENV === "development") {
		await loadEnvironmentVariables();
	}

	const options = {
		host: process.env.REDIS_DOMAIN_NAME,
		port: Number(process.env.REDIS_PORT_NUMBER),
		retryStrategy: (times: number) => {
			// reconnect after
			return Math.min(times * 50, 2000);
		},
	};

	// establish connection to database
	const dbConnection = await establishConnectionToDatabase();

	// const pubsub = new PubSub();
	const pubsub = new RedisPubSub({
		publisher: new Redis.default(options.port!, options.host!, {
			password: process.env.REDIS_PASSWORD,
		}),
		subscriber: new Redis.default(options.port!, options.host!, {
			password: process.env.REDIS_PASSWORD,
		}),
	});

	// setup graphql server
	const graphqlServer = new ApolloServer({
		validationRules: [depthLimit(6)],
		schema: await buildSchema({
			authChecker: graphqlAuthorizationChecker,
			authMode: "error",
			resolvers: [
				HelloResolver,
				UserResolver,
				MessageResolver,
				ChatReportResolver,
				BlockUserResolver,
				AdminResolver,
				TransactionResolver,
				TherapistResolver,
				AppointmentRatingResolver,
				NotificationResolver,
				AppointmentResolver,
			],
		}),
		context: async ({ req, res, connection }) => {
			// if this is a HTTP connection
			if (req) {
				const token = req.headers?.authorization?.split(" ")[1] || "";
				const [isTokenValid, tokenPayload] = await isJwtTokenValid(token.trim());

				if (!isTokenValid || !tokenPayload) {
					throw new AuthenticationError("Token is invalid");
				}

				let user;

				if (tokenPayload.userRole === EUserRole.ADMIN) {
					user = await Admin.findOne(tokenPayload.sub as string);
				} else {
					const userDao = new UserDao();
					user = await userDao.getUserById(tokenPayload.sub as string);
				}

				if (!user) {
					throw new AuthenticationError("User is not valid");
				}

				if (tokenPayload.userRole === EUserRole.ADMIN) {
					req.admin = user as Admin;
				} else {
					req.user = user as User;
				}

				// console.log("Inside context(), user: ", user);
			}

			// console.log("Context creation took: ", end - start, " ms");

			return {
				req,
				res,
				user: connection?.context.user,
				dbConnection,
				pubsub,
			};
		},
		subscriptions: {
			keepAlive: 10000,
			onConnect: async (connectionParams, websocket, { request }) => {
				// @ts-ignore
				const token = connectionParams.Authorization.split(" ")[1] || "";
				const [isTokenValid, tokenPayload] = await isJwtTokenValid(token.trim());

				if (!isTokenValid || !tokenPayload) {
					throw new AuthenticationError("Token is invalid");
				}

				let user;

				if (tokenPayload.userRole === EUserRole.ADMIN) {
					user = await Admin.findOne(tokenPayload.sub as string);
				} else {
					const userDao = new UserDao();
					user = await userDao.getUserById(tokenPayload.sub as string);
				}

				if (!user) {
					throw new AuthenticationError("User is not valid");
				}

				return { user: user };
			},
		},
	});
	graphqlServer.start();

	// https://stackoverflow.com/questions/61467065/subscriptions-not-working-on-apollo-server-express
	// setup express app
	const app = express();
	// apply middleware
	applyMiddleware(app);

	// use httpServer for graphql
	const httpServer = createServer(app);
	graphqlServer.applyMiddleware({ app });
	graphqlServer.installSubscriptionHandlers(httpServer);

	return { httpServer, graphqlServer };
}
