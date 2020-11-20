// Strict mode
/* The purpose of "use strict" is to indicate that the code should be executed in "strict mode".
   With strict mode, you can not, for example, use undeclared variables. */
"use strict";

// When using loose Javascript files:
// const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

//
const aws_region = 'eu-central-1'
const user_pool_id = 'eu-central-1_XF6j2vIXd';
// const app_client_id = '6fpkmctg6bhrmmc6s0nvq3lcov'; oud
const app_client_id = '605sohtean6blhf6d2gr7fbfun';
const identity_pool_id = 'eu-central-1:359af870-6f20-411f-a1bb-71147584b10d';
const login_token = `cognito-idp.${aws_region}.amazonaws.com/${user_pool_id}`;

AWS.config.region = aws_region;

const poolData = {
  UserPoolId: user_pool_id,
  ClientId: app_client_id
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

let cognitoidentityserviceprovider;


//
const userAuthentication = function (user_email, user_password) {
  const userData = {
    Username: user_email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authenticationData = {
    Username: user_email,
    Password: user_password
  };

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: identity_pool_id,
        Logins: {
          [login_token]: result.getIdToken().getJwtToken()
        }
      });

      AWS.config.credentials.refresh(function (err) {
        if (err) {
          console.error(err.message || JSON.stringify(err));
        } else {
          // TODO
          const app = "bm_ab";

          // TODO: Improve quick fix below to async/await?
          // const url_base = config_url[0];
          // const url_full = new URL(`${config_url[1]}meetel/recordsmap`, url_base);
          const url_base = "https://geq6nr64z5.execute-api.eu-central-1.amazonaws.com";
          const url_full = new URL(`/api/users/${app}/get-user/${cognitoUser.username}`, url_base);
          // const user_name = cognito_user.username;
          // const idToken = localStorage.getItem(`CognitoIdentityServiceProvider.${app_client_id}.${user_name}.idToken`);

          fetch(url_full)
            .then((response) => {
              return response.json()
            })
            .then((data) => {
              sessionStorage.setItem('bm.user.data', JSON.stringify(data));
            })
            .then(() => {
              location.href = '/';
            })
            .catch((error) => {
              console.error('Error:', error);
            });
        }
      });
    },

    newPasswordRequired: function (userAttributes, requiredAttributes) {
      alert("New password required.");

      location.href = './change-password';
    },

    onFailure: function (err) {
      console.error(err.message || JSON.stringify(err));

      if (err.code === "NotAuthorizedException") {
        alert(err.message || JSON.stringify(err));
      }

      if (err.code === "newPasswordRequired") {
        location.href = '/login/change-password';
      }
    }

  });
}


//
const getUser = function () {
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser == null) {
    location.href = '/login';
  }

  return cognitoUser;
}


//
const logOutUser = function () {
  const cognitoUser = userPool.getCurrentUser();
  cognitoUser.signOut();

  localStorage.removeItem('td.groups');
  localStorage.removeItem('td.user.abbr');
  location.href = '/login';
}


//
const refreshToken = function () {
  const cognitoUser = getUser();

  cognitoUser.getSession(function (err, session) {
    if (err) {
      console.error(err.message || JSON.stringify(err));
      return;
    }

    // console.log('session validity: ' + session.isValid());
    // console.log(session);

    // receive session from calling cognitoUser.getSession()
    const refresh_token = session.getRefreshToken();
    // console.log(refresh_token);

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: identity_pool_id,
      Logins: {
        [login_token]: session.getIdToken().getJwtToken()
      }
    });

    if (AWS.config.credentials.needsRefresh()) {
      cognitoUser.refreshSession(refresh_token, function (err, session) {
        if (err) {
          console.error(err.message || JSON.stringify(err));
        } else {
          // AWS.config.credentials.params.Logins[
          //   'cognito-idp.<YOUR-REGION>.amazonaws.com/<YOUR_USER_POOL_ID>'
          // ] = session.getIdToken().getJwtToken();
          // AWS.config.credentials.refresh(err => {
          //   if (err) {
          //     console.error(err.message || JSON.stringify(err));
          //   } else {
          //     console.log('TOKEN SUCCESSFULLY UPDATED');
          //   }
          // });
          console.log('TOKEN SUCCESSFULLY UPDATED');
        }
      });
    }
    // if (session.isValid()) {
    //   console.log('do nothing');
    //   if (html_body.classList.contains('is-hidden')) {
    //     html_body.classList.remove('is-hidden');
    //   }

    // } else {
    //   console.log('do something');

    //   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    //     IdentityPoolId: identity_pool_id,
    //     Logins: {
    //       [login_token]: session.getIdToken().getJwtToken()
    //     }
    //   });

    //   console.log(AWS.config.credentials.needsRefresh());

    //   if (AWS.config.credentials.needsRefresh()) {
    //     const refresh_token = session.getRefreshToken();

    //     cognitoUser.refreshSession(refresh_token, (err, session) => {
    //       if (err) {
    //         console.error(err.message || JSON.stringify(err));
    //       } else {
    //         AWS.config.credentials.params.Logins[login_token] = session.getIdToken().getJwtToken();
    //         AWS.config.credentials.refresh((err) => {
    //           if (err) {
    //             console.error(err.message || JSON.stringify(err));
    //           } else {
    //             console.log("Token succesfully updated");
    //           }
    //         });
    //       }
    //     });
    //   }
    // }
  });
}
// refreshToken();


function changePassword(user_email, user_password_old, user_password_new) {
  const userData = {
    Username: user_email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  const authenticationData = {
    Username: user_email,
    Password: user_password_old
  };

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function () {},

    newPasswordRequired: function () {
      let attributesData = "";

      cognitoUser.completeNewPasswordChallenge(user_password_new, attributesData, this);

      alert("Password changed. Please log in with new password.");

      location.href = '/login';
    },

    onFailure: function (err) {
      console.error(err.message || JSON.stringify(err));

      if (err.code === "NotAuthorizedException") {
        alert(err.message || JSON.stringify(err));
      }
    }
  });
}


function forgotPassword(user_email) {
  const userData = {
    Username: user_email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.forgotPassword({
    onSuccess: function (data) {
      alert(`A verification code was sent to: ${data.CodeDeliveryDetails.Destination}`);
      location.href = '/login/confirm-password';
    },

    onFailure: function (err) {
      alert(err.message || JSON.stringify(err));
    },

  });
}


function confirmPassword(user_email, verification_code, user_password_new) {
  const userData = {
    Username: user_email,
    Pool: userPool
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.confirmPassword(verification_code, user_password_new, {
    onSuccess() {
      alert('Password confirmed. Please log in with new password.');
      location.href = '/login';
    },

    onFailure(err) {
      alert(err.message || JSON.stringify(err));
    },

  });

}


//
const addUserToGroup = function (group_name, username) {
  const params = {
    GroupName: group_name,
    UserPoolId: user_pool_id,
    Username: username
  };

  cognitoidentityserviceprovider.adminAddUserToGroup(params, function (err, data) {
    if (err) { // an error occurred
      console.log(err, err.stack);
      alert(err.code);
    } else {
      // console.log(data); // successful response
    }
  });
}


//
const createUser = function (form_data) {
  AWS.config.update({
    accessKeyId: form_data.akid,
    secretAccessKey: form_data.sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  const params = {
    UserPoolId: user_pool_id,
    Username: form_data.username,
    // DesiredDeliveryMediums: ["EMAIL"],
    DesiredDeliveryMediums: [],
    MessageAction: "SUPPRESS",
    TemporaryPassword: form_data.password,
    UserAttributes: [{
        Name: "email",
        Value: form_data.email
      },
      {
        Name: "email_verified",
        Value: "true"
      },
      {
        Name: "custom:abbreviation",
        Value: form_data.abbreviation
      }
    ]
  };

  cognitoidentityserviceprovider.adminCreateUser(params, function (err, data) {
    if (err) { // an error occurred
      console.log(err, err.stack);
      alert(err.code);
    } else {
      addUserToGroup(`org.${form_data.org.toLowerCase()}`, form_data.username);

      addUserToGroup(`role.${form_data.role.toLowerCase()}`, form_data.username);

      // handle pages
      if ("page_historic" in form_data) {
        addUserToGroup("page.historic", form_data.username);
      }
      if ("page_realtime" in form_data) {
        addUserToGroup("page.realtime", form_data.username);
      }
      if ("page_meetel" in form_data) {
        addUserToGroup("page.meetel", form_data.username);
      }
      if ("page_invoer" in form_data) {
        addUserToGroup("page.invoer", form_data.username);
      }
      if ("page_tables" in form_data) {
        addUserToGroup("page.tables", form_data.username);
      }

      // handle modules
      if ("module_file" in form_data) {
        addUserToGroup("module.file", form_data.username);
      }
      if ("module_gms" in form_data) {
        addUserToGroup("module.gms", form_data.username);
      }
      if ("module_im" in form_data) {
        addUserToGroup("module.im", form_data.username);
      }
      if ("module_mor" in form_data) {
        addUserToGroup("module.mor", form_data.username);
      }
      if ("module_ndw" in form_data) {
        addUserToGroup("module.ndw", form_data.username);
      }
      if ("module_parking" in form_data) {
        addUserToGroup("module.parking", form_data.username);
      }
      if ("module_sim" in form_data) {
        addUserToGroup("module.sim", form_data.username);
      }
      if ("module_tlc" in form_data) {
        addUserToGroup("module.tlc", form_data.username);
      }
      if ("module_weather" in form_data) {
        addUserToGroup("module.weather", form_data.username);
      }
      if ("module_meetel" in form_data) {
        addUserToGroup("module.meetel", form_data.username);
      }

      // handle abbreviation
      // if (form_data.org.toLowerCase() === "meetel") {
      //   addUserToGroup("user.abbreviation", form_data.abbreviation);
      // }

      // console.log(data); // successful response
      alert(`Succesfully added user: ${data.User.Username}`); // successful response
    }
  });
}


//
const getUsers = function (akid, sak) {
  AWS.config.update({
    accessKeyId: akid,
    secretAccessKey: sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  const params = {
    UserPoolId: user_pool_id,
    AttributesToGet: [
      'email',
    ],
  };

  cognitoidentityserviceprovider.listUsers(params, function (err, data) {
    if (err) { // an error occurred
      console.log(err.code);
      console.log(err.message);
    } else {
      console.log("data", data);
    }
  });
}


//
const getUsersInGroup = function (akid, sak, group_name) {
  AWS.config.update({
    accessKeyId: akid,
    secretAccessKey: sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  const params = {
    UserPoolId: user_pool_id,
    GroupName: group_name,
  };

  cognitoidentityserviceprovider.listUsersInGroup(params, function (err, data) {
    if (err) { // an error occurred
      console.log(err.code);
      console.log(err.message);
    } else {
      console.log("data", data);
    }
  });
}


//
const getGroupsForUser = function (akid, sak, username) {
  AWS.config.update({
    accessKeyId: akid,
    secretAccessKey: sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  const params = {
    UserPoolId: user_pool_id,
    Username: username,
  };

  cognitoidentityserviceprovider.adminListGroupsForUser(params, function (err, data) {
    if (err) { // an error occurred
      console.log(err.code);
      console.log(err.message);
    } else {
      console.log("data", data);
    }
  });
}


//
const updateUser = function (form_data) {
  AWS.config.update({
    accessKeyId: form_data.akid,
    secretAccessKey: form_data.sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  cognitoidentityserviceprovider.adminUpdateUserAttributes({
      UserPoolId: user_pool_id,
      Username: form_data.username,
      UserAttributes: [{
        Name: "custom:abbreviation",
        Value: form_data.abbreviation
      }]
    },
    function (err, data) {
      if (err) { // an error occurred
        console.log(err.code);
        console.log(err.message);
        alert(err.message);
      } else {
        // console.log("data", data);
        alert(`Succesfully updated user: ${form_data.username}`); // successful response
      }
    }
  );
}


//
const updateUserPassword = function (form_data) {
  AWS.config.update({
    accessKeyId: form_data.akid,
    secretAccessKey: form_data.sak,
    region: aws_region
  });

  cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: "2016-04-19",
    region: aws_region
  });

  const params = {
    UserPoolId: user_pool_id,
    Username: form_data.username,
    Password: form_data.password,
    Permanent: false
  };

  cognitoidentityserviceprovider.adminSetUserPassword(params,
    function (err, data) {
      if (err) { // an error occurred
        console.log(err.code);
        console.log(err.message);
        alert(err.message);
      } else {
        // console.log("data", data);
        alert(`Succesfully updated user: ${form_data.username}`); // successful response
      }
    }
  );
}