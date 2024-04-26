import fs from "fs";

function populateENV() {
  let secrets;

  try {
    secrets = require("./secrets.json");
  } catch (err) {
    console.log("secrets.json file not found.");
    return;
  }

  const { project_id, private_key, client_email } = secrets;

  const envData = {
    PROJECT_ID: project_id,
    PRIVATE_KEY: private_key.replace(/\n/g, "\\n"),
    CLIENT_EMAIL: client_email,
    SPREADSHEET_ID: "",
  };

  const envContent = Object.entries(envData)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");

  fs.writeFileSync(".env", envContent);
  console.log(".env file has been successfully populated.");
}

populateENV();
