function getMetas() {
  const metas = {};
  const metaElements = document.getElementsByTagName("meta");

  for (let i = 0; i < metaElements.length; i++) {
    metas[metaElements[i].getAttribute("name")] =
      metaElements[i].getAttribute("content");
  }

  return metas;
}

function initializeSSO() {
  console.log("Initializing LaoID SSO...");
  if (window.LaoIdSSO && window.LaoIdSSO.isInitialize) {
    return;
  }
  window.LaoIdSSO = {};
  window.LaoIdSSO.isInitialize = true;

  console.log("Load LaoID SSO");
  // Get config
  const metas = getMetas();

  window.LaoIdSSO.clientId = metas["laoid-signin-client-id"];
  window.LaoIdSSO.redirectUri = metas["laoid-signin-redirect-uri"];
  window.LaoIdSSO.useCallbackUri =
    metas["laoid-signin-use-callback-uri"] === "true";
  window.LaoIdSSO.apiEndpoint =
    "https://demo-sso.tinasoft.io/api/v1/third-party/authorize-host";

  window.LaoIdSSO.init = (clientId, redirectUri, useCallbackUri) => {
    window.LaoIdSSO.clientId = clientId;
    window.LaoIdSSO.redirectUri = redirectUri;
    window.LaoIdSSO.useCallbackUri = useCallbackUri || false;
    initSignInButton();
  };

  if (window.LaoIdSSO.clientId) {
    initSignInButton();
  }
}

async function openSSO() {
  const popupWidth = 455;
  const popupHeight = 810;

  const windowWidth = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
    ? document.documentElement.clientWidth
    : screen.width;
  const windowHeight = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
    ? document.documentElement.clientHeight
    : screen.height;

  const left = windowWidth / 2 - popupWidth / 2 + window.screenLeft;
  const top = windowHeight / 2 - popupHeight / 2 + window.screenTop;

  window.open(
    `https://demo-sso.tinasoft.io/login?client_id=${window.LaoIdSSO.clientId}&redirect_uri=${window.LaoIdSSO.redirectUri}&use_callback_uri=${window.LaoIdSSO.useCallbackUri}`,
    "LaoID",
    `height=${popupHeight},width=${popupWidth},top=${top},left=${left},resizable=no,location=no,menubar=no`,
  );
}

async function initSignInButton() {
  const signInButton = document.getElementById("laoid-signin");
  if (!signInButton) {
    console.log("Load LaoID SSO failed due to no button with id laoid-signin");
    return;
  }

  const response = await fetch(window.LaoIdSSO.apiEndpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: window.LaoIdSSO.clientId,
      host: "localhost",
    }),
  });
  const responseData = await response.json();
  console.log("Response from LaoID SSO:", responseData);
  if (
    response.ok &&
    responseData.success &&
    window.LaoIdSSO.clientId &&
    window.LaoIdSSO.redirectUri
  ) {
    console.log("Load LaoID SSO successfully");

    signInButton.removeEventListener("click", openSSO);
    signInButton.addEventListener("click", openSSO);
  } else if (response.ok && !responseData.success) {
    console.error(
      "Wrong laoid-signin-client-id or laoid-signin-redirect-uri. Please input the correct information or contact admin of LaoID",
    );
  } else {
    console.error(
      "Please add laoid-signin-client-id and laoid-signin-redirect-uri to metadata",
    );
  }
}

initializeSSO();
