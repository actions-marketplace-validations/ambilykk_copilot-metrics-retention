// libs for github & graphql
const core = require('@actions/core');
const github = require('@actions/github');
const fs = require("fs");

// get the octokit handle 
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);

// inputs defined in action metadata file
const org_Name = core.getInput('org_name');
const json_path = core.getInput('json_path');

let totalSeats = 0;

// Copilot Usage Metrics API call
async function getUsage(org) {
    try {

        return await octokit.request('GET /orgs/{org}/copilot/usage', {
            org: org_Name,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

    } catch (error) {
        core.setFailed(error.message);
    }
}

// Extract Copilot usage data with a pagination of 50 records per page
async function run(org_Name, csv_path) {

    try {

        await getUsage(org_Name).then(metricsResult => {
            console.log(`usage metrics result: ${JSON.stringify(metricsResult)}`);

            let metricsData = metricsResult.data;

            //TODO: check the file exists or not 
            if (!fs.existsSync(json_path)) {
                // The file doesn't exist, create a new one with an empty JSON object
                fs.writeFileSync(json_path, JSON.stringify('', null, 2));
            }
            
            //TODO: check the file is empty or not
            let data = fs.readFileSync(json_path, 'utf8'); // read the file

            // file contains only [] indicating a blank file
            // append the entire data to the file
            if (data.trim() === '' || data.trim() === '{}') {
                fs.appendFileSync(json_path, JSON.stringify(metricsData));
            } else {
               //TODO: find the delta and append to existung file
            }

        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

console.log(`preamble: org name: ${org_Name} `);

// run the action code
run(org_Name, json_path);
