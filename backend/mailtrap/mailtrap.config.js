import {MailtrapClient} from 'mailtrap';

const TOKEN = 'd79f32b64388f41489113280d73c2e42';

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: 'mailtrap@demomailtrap.com',
  name: 'Mailtrap Test',
};
const recipients = [
  {
    email: 'nelsonobuya18@gmail.com',
  },
];

client
  .send({
    from: sender,
    to: recipients,
    subject: 'You are awesome!',
    text: 'Congrats for sending test email with Mailtrap!',
    category: 'Integration Test',
  })
  .then(console.log, console.error);
