<a href="https://expense-sheet-viewer.vercel.app/">
  <h1 align="center">Expense Sheet Viewer</h1>
</a>

<div align="center">
  <figure>
    <a href="https://expense-sheet-viewer.vercel.app/" target="_blank" rel="noopener">
      <img src="https://utfs.io/f/b1264b14-5018-4191-ac92-8d43fefd2057-3ynnlp.png" alt="Filter expenses page" />
    </a>
    <figcaption>
      <p align="center">
        Analyze expenses and spend decisively.
      </p>
    </figcaption>
  </figure>
</div>


## Introduction

This is a NextJS application that can be used to analyze a [Google Sheets](https://docs.google.com/spreadsheets/d/12vmkA6MIJa0RFHHOAKgubywgfdK-lDqH_nesfn1jWWg/edit?usp=sharing) that holds the expenses detail. This can be used to keep a track of expenses and then analyze them later on. One can manually create an entry in the sheet or can go ahead an create a Google Form (similar to [this](https://forms.gle/oVK5kcAP3Pe3JYBf9) one) that can help in entering the details.

## Built With

- [Next.js](https://nextjs.org/)
- [React.js](https://reactjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Google Sheets API](https://developers.google.com/sheets/api/guides/concepts)

## Features

1. See the latest expense added to the sheet.
1. Filter expenses on the basis of dates displaying a filtered expenses table and a pie chart.

[More](#upcoming-features) coming soon...

## Directory Structure

This project uses [NextJS pages router](https://nextjs.org/docs/pages) based directory structure.

    .
    ├── src                        # Contains the files related to the project
    │   ├── components             # Reusable UI components, including those from shadcn/ui
    │   ├── lib                    # Commonly used utility functions
    │   ├── pages                  # Next.js page router
    │   │   ├── api                # Server-side logic for API endpoints
    │   │   └── index.tsx          # Main entry point for the application
    │   └── styles                 # Tailwind CSS styles                
    └── README.md


## Getting Started

To get a local copy up and running, please follow these simple steps.

### Pre-requisites

- [Node.js 18.17](https://nodejs.org/) or later.
- A Google Sheets similar to [this](https://docs.google.com/spreadsheets/d/12vmkA6MIJa0RFHHOAKgubywgfdK-lDqH_nesfn1jWWg/edit?usp=sharing) one.

### Setup

1. Firstly since the application reads data from a Google Sheets using the Google Sheets API, create an excel sheet similar to [this](https://docs.google.com/spreadsheets/d/12vmkA6MIJa0RFHHOAKgubywgfdK-lDqH_nesfn1jWWg/edit?usp=sharing) one. Use the **Make a copy** option from the sample sheet to create a copy of the excel sheet. You can also create a Google Form (similar to [this](https://forms.gle/oVK5kcAP3Pe3JYBf9) one) which will then feed the data into it's own sheet.

1. Next step to is to generate a credentials file which will have the credentials that will be used to fetch data using Google Sheets API. 

    a. Create a Google Cloud project from the Google Cloud console. You can follow the instructions [here](https://developers.google.com/workspace/guides/create-project#google-cloud-console) for more information on how to do that.

    b. Enable the Google Sheets API from [this](https://console.cloud.google.com/apis/library/sheets.googleapis.com) link.

    c. You need to create a service account that will access the sheets data. For that follow the instructions on [this](https://developers.google.com/workspace/guides/create-credentials#create_a_service_account) page.

    d. After creating the service all that's left is to generate the credentials file, it can be done by following the instructions on [this](https://developers.google.com/workspace/guides/create-credentials#create_credentials_for_a_service_account) page.

1. After generating the credentials file, clone this repository:

    ```shell
      git clone https://github.com/sbansal1999/expense-sheet-viewer
    ``` 

1. Move the credentials file to the project's root directory folder and make sure to rename it as `secrets.json` and then run the following command which will auto-populate the `.env` file from the credentials file. 

    ```shell
      node env-util.js
    ```

    Note: You can also manually copy the credentials to the `.env` file, this script just automates that part.

1. The `SPREADSHEET_ID` that is required in the `.env` file can be extracted from the Sheet URL. 
   
   For example, the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
   Populate the `.env` file with this spreadsheet ID.
     
2. After filling the `.env` file all that's left is to give the Google Sheet access to the service account that was created earlier. The service account email address is in the `.env` file as `CLIENT_EMAIL`. More information on how you can do it [here](https://support.google.com/docs/answer/9331169?hl=en#6.1).

3. Install dependencies required for the project:

    ```shell
    pnpm install
    ```

4. Run the project locally:

    ```shell
    pnpm run dev
    ```

### Useful Links

- [Google Sheets… Your Next Database?](https://youtu.be/K6Vcfm7TA5U?si=6S_vQ3rvw1UNChGj) - Fireship
- [Google Workspace Documentation](https://developers.google.com/workspace/guides/get-started)

## Contributing

- [Open an issue](https://github.com/sbansal1999/expense-sheet-viewer/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/sbansal1999/expense-sheet-viewer/pulls) to add new features/make quality-of-life improvements/fix bugs.


## Known Issues

- [X] Sorting of table on the basis of timestamp doesn't work properly due to it being considered a string. (on [/filters](https://expense-sheet-viewer.vercel.app/filter) page)
- [ ] No proper loading component as of now.
- [X] When there are some empty fields in the middle of the last expense row, the empty rows are also shown. (on [/](https://expense-sheet-viewer.vercel.app) page).
- [ ] There are cases when the end date is not considered in the filtering of expenses. (on [/filters](https://expense-sheet-viewer.vercel.app/filter) page)

## Upcoming Features

- [ ] Add detailed monthly expense analysis containing information like how expenses has increased/decreased over the months.
- [ ] Add search functionality to search for a particular expense in the [/filters](https://expense-sheet-viewer.vercel.app/filter) page.



