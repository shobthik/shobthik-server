import { Query } from "type-graphql";

export default class HelloResolver {
  @Query(() => String)
  hello() {
    return "hello from ShobThik";
  }
}
