import { bootstrap } from "./server";

(async () => {
  const { httpServer, graphqlServer } = await bootstrap();

  const PORT = process.env.PORT || 4000;

  httpServer.listen(PORT, () => {
    console.log(
      `Server ready at http://localhost:${PORT}${graphqlServer.graphqlPath}`,
    );
    console.log(
      `Subscriptions ready at ws://localhost:${PORT}${graphqlServer.subscriptionsPath}`,
    );
  });
})();
