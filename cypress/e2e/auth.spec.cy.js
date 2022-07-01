let authRequestOptions = {
    failOnStatusCode: false,
    method: 'POST',
    url: Cypress.env('auth_base_url') + '/connect/token',
    headers:{
        "content-type": 'application/x-www-form-urlencoded'
    },
    body: {  
    }
}

describe('Auth with valid credentials test', () => {
  const validSchema = {
    "type": "object",
    "properties": {
      "access_token": {
        "type": "string"
      },
      "expires_in": {
        "type": "integer"
      },
      "token_type": {
        "type": "string"
      },
      "refresh_token": {
        "type": "string"
      },
      "scope": {
        "type": "string"
      }
    },
    "required": [
      "access_token",
      "expires_in",
      "token_type",
      "refresh_token",
      "scope"
    ]
  };

  before(() => {
    cy.fixture('credentials').then(data => {
      authRequestOptions.body = {
          client_id: "external",
          scope: "all offline_access",
          grant_type: "password",
          username: data.activeUser.email,
          password: data.activeUser.password,
      };
    }); 
  });

  it('Should send the request with valid credentials and verify the response', () => {
      cy.request(authRequestOptions).then((response) => {
          expect(response.status).to.equal(200); 

          cy.validateSchema(validSchema, response.body).then(() => {
            expect(response.body.expires_in).to.be.equal(3600);
            expect(response.body.token_type).to.be.equal('Bearer');
            expect(response.body.scope).to.be.equal('all offline_access');
          });
      });
  })
})

describe('Auth with invalid password test', () => {
  const validSchema = {
    "type": "object",
    "properties": {
      "error": {
        "type": "string"
      },
      "error_description": {
        "type": "string"
      }
    },
    "required": [
      "error",
      "error_description"
    ]
  }

  before(() => {
    cy.fixture('credentials').then(data => {
      authRequestOptions.body = {
          client_id: "external",
          scope: "all offline_access",
          grant_type: "password",
          username: data.activeUser.email,
          password: 'incorrect_password',
      };
    }); 
  });

  it('Should send the request with invalid password and verify the response', () => {
      cy.request(authRequestOptions).then((response) => {
          expect(response.status).to.equal(400); 

          cy.validateSchema(validSchema, response.body).then(() => {
            expect(response.body.error).to.be.equal('invalid_grant');
            expect(response.body.error_description).to.be.equal('Пользователь не найден. Возможно введен неправильный адрес эл. почты / пароль или пользователь с таким адресом еще не зарегистрирован.');
          });
      });
  })
})

describe('Update access token test', () => {
  let oldAccessToken;
  let oldRefreshToken;

  before(() => {
    cy.fixture('credentials').then(data => {
      authRequestOptions.body = {
          client_id: "external",
          scope: "all offline_access",
          grant_type: "password",
          username: data.activeUser.email,
          password: data.activeUser.password,
      };
    }); 
  });

  it('Should pass auth and save access & refresh tokens', () => {
      cy.request(authRequestOptions).then((response) => {
          expect(response.status).to.equal(200); 

          oldAccessToken = response.body.access_token;
          oldRefreshToken = response.body.refresh_token;
      });
  })

  it('Should update access token', () => {
    authRequestOptions.body = {
      client_id: "external",
      scope: "all offline_access",
      grant_type: "refresh_token",
      refresh_token: oldRefreshToken
  };

  // without wait access token fails to update sometimes (refresh is updated ok)
  cy.wait(1000).then(() => {
      cy.request(authRequestOptions).then((response) => {
        expect(response.status).to.equal(200); 

        expect(response.body.access_token).to.be.not.equal(oldAccessToken);
        expect(response.body.refresh_token).to.be.not.equal(oldRefreshToken);      
      });
    });
  })
})