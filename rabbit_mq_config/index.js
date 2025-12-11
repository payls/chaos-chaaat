const rchannel = require('./lib/connect');
const {
  processQnames, createQs, deleteQs, purgeQs
} = require('./lib/helpers');

const operation = process.env.OPT || 'create';

rchannel.addSetup((channel) => {
  const procQnames = processQnames();

  if (operation === 'create') {
    return createQs(channel, procQnames);
  }

  if (operation === 'purge') {
    return purgeQs(channel, procQnames);
  }

  if (operation === 'delete') {
    return deleteQs(channel, procQnames);
  }
});

rchannel.waitForConnect()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.log(err)
    process.exit();
  })


// docker run -d --hostname rabbitmq --name rabbitmq -p 15672:15672 -p 5672:5672 -e RABBITMQ_DEFAULT_USER=root -e RABBITMQ_DEFAULT_PASSW=root rabbitmq:3-management