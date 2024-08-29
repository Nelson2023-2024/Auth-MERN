import {MailtrapClient} from 'mailtrap';

const TOKEN = 'd79f32b64388f41489113280d73c2e42';

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: 'mailtrap@demomailtrap.com',
  name: 'Mailtrap Test',
};
export const recipients = [
  {
    email: 'nelsonobuya18@gmail.com',
  },
];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: 'You are awesome!',
//     text: 'Congrats for sending test email with Mailtrap!',
//     category: 'Integration Test',
//   })
//   .then(console.log, console.error);
