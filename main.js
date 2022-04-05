import nodemailer from "nodemailer"
import { program, Option } from 'commander'
import airtable from 'airtable'

program
    .addOption(new Option('-k, --key <key>', 'Airtable api key').env("AIRTABLE_API_KEY").makeOptionMandatory())
    .addOption(new Option('-b, --base <base>', 'Airtable base').env("AIRTABLE_BASE").makeOptionMandatory())
    .addOption(new Option('-t, --table <base>', 'Airtable table').env("AIRTABLE_TABLE").makeOptionMandatory())
    .addOption(new Option('-u, --user <username>', 'SMTP username').env("USERNAME").makeOptionMandatory())
    .addOption(new Option('-p, --password <password>', 'SMTP password').env("PASSWORD").makeOptionMandatory())
    .option("-p, --page <number>", "Airtable pageSize, the number of records returned in each request.", 100)
    .option("--fieldFrom <string>", "Airtable from field", "from")
    .option("--fieldTo <string>", "Airtable to field", "to")
    .option("--fieldSubject <string>", "Airtable subject field", "subject")
    .option("--fieldHtml <string>", "Airtable html field", "html")
    .option("--fieldText <string>", "Airtable text field", "text")
    .option("--fieldAttachments <string>", "Airtable attachments field", "attachments")
    .option("--fieldMessageId <string>", "Airtable messageId field", "messageId")
    .option("--maxConnections <number>", "nodemailer maxConnections", 5)
    .option("-d, --dry-run", "dry run")
    .option("-v, --verbose", "debug")
    .parse();
const options = program.opts();

if (options.debug) console.log(options)

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

const table = airtable.base(options.base)(options.table);
const results = []

await table.select({
    pageSize: options.page,
    view: "Grid view"
}).eachPage(async function page(records, fetchNextPage) {
    console.time(`sendMail ${records.length}`);
    records.forEach(async function (record) {
        let attachments
        if (Array.isArray(record.get(options.fieldAttachments))) {
            attachments = record.get(options.fieldAttachments).map(attachment=> ({
                filename: attachment.filename,
                href: attachment.url,
                contentType: attachment.type
            }))
        }
        const message = {
            from: record.get(options.fieldFrom),
            to: record.get(options.fieldTo),
            subject: record.get(options.fieldSubject),
            text: record.get(options.fieldText),
            html: record.get(options.fieldHtml),
            attachments
        }

        if (options.dryRun) {
            console.log(message)
            results.push(Promise.resolve(message))
            return
        }

        // const result = transporter.sendMail(message)
        //     .then((result) => record.updateFields({
        //         [options.fieldMessageId]:  result.messageId
        //     }))
        //     .catch((err) => console.error(record.id, err))

        // results.push(result)
    });

    await Promise.all(results)
    console.timeEnd(`sendMail ${records.length}`);

    fetchNextPage();
}).catch(console.error)

transporter.close();
