import nodemailer from "nodemailer"
import { program, Option } from 'commander'
import airtable from 'airtable'

program
    .addOption(new Option('-k, --key <key>', 'Airtable api key').env("AIRTABLE_API_KEY").makeOptionMandatory())
    .addOption(new Option('-b, --base <base>', 'Airtable base').env("AIRTABLE_BASE").makeOptionMandatory())
    .addOption(new Option('-u, --user <username>', 'SMTP username').env("USERNAME").makeOptionMandatory())
    .addOption(new Option('-p, --password <password>', 'SMTP password').env("PASSWORD").makeOptionMandatory())
    .addOption(new Option('-f, --from <sender>', 'SMTP from ex. name <name@example.com>').env("FROM").makeOptionMandatory())
    .option("-p, --page <number>", "Airtable pageSize, the number of records returned in each request.", 10)
    .option("--fieldTo <string>", "Airtable to field", "to")
    .option("--fieldSubject <string>", "Airtable subject field", "subject")
    .option("--fieldHtml <string>", "Airtable html field", "html")
    .option("--fieldText <string>", "Airtable text field", "text")
    .option("--maxConnections <number>", "nodemailer maxConnections", 10)
    .parse();
const options = program.opts();

console.log(options)

airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: options.key
});

console.time("createTransport");
const transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: options.maxConnections,
    secure: true,
    host: "smtp.gmail.com",
    auth: {
        user: options.user,
        pass: options.password,
    },
});
await transporter.verify();
console.timeEnd("createTransport");
console.log(transporter)

const base = airtable.base(options.base);

base('Extern').select({
    pageSize: options.page,
    view: "Grid view"
}).eachPage(async function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    const messages = []

    records.forEach(function (record) {
        messages.push({
            to: record.get(options.fieldTo),
            subject: record.get(options.fieldSubject),
            text: record.get(options.fieldText),
            html: record.get(options.fieldHtml),
        })
    });

    console.log(messages)

    // console.time("sendMail");
    // const statuses = messages.map((message) =>
    //     transporter
    //         .sendMail({
    //             from: options.from,
    //             to: message.to,
    //             subject: message.subject,
    //             text: message.text,
    //             html: message.html,
    //             attachments: message.attachments,
    //         })
    //         .then(
    //             (success) => {
    //                 console.log("Sent", message.id, message.to, success.messageId);
    //                 return success;
    //             },
    //             (error) => {
    //                 console.error("Error ", message.id, message.to, error);
    //                 return error;
    //             }
    //         )
    // );

    // let infos = await Promise.all(statuses);
    // console.timeEnd("sendMail");

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
});

// console.log("Sending completed");
// transporter.close();