import Ajv from "ajv"

Cypress.Commands.add('validateSchema', (schema, responseBody) => {
    const ajv = new Ajv();
    expect(ajv.validate(schema, responseBody), JSON.stringify(ajv.errors)).to.be.true;
});