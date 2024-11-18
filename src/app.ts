import {ParserService} from "./services/parser.service";

const parserService = new ParserService();
await parserService.retrieveOrganisationAttributes();
