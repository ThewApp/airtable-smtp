# Airtable SMTP

Send email with data from [Airtable](https://airtable.com) in Node.js through [SMTP](https://nodemailer.com/usage/why-smtp/) using [nodemailer](https://github.com/nodemailer/nodemailer).

## Usage

See help.

```sh
node main.js -h
```

#### Setup

Install dependencies.

```sh
npm i
```

Set the required envs.

```sh
export AIRTABLE_API_KEY=""
export AIRTABLE_BASE=""
export AIRTABLE_TABLE=""
export USERNAME=""
export PASSWORD=""
```

#### Airtable

Airtable must have the following columns/fields. See [nodemailer docs](https://nodemailer.com/message/) for description. It can be configured through parameters `--field*`.

- from
- to
- subject
- html
- text
- attachments
- messageId - for storing the final SMTP messageId only, it will not be read.

#### Test

```sh
node main.js -d # test with dry run
```

#### Run

```sh
node main.js -V # will show parsed options
```

or

```sh
node main.js
```

## Thank you!

<a href="https://www.buymeacoffee.com/thew" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
