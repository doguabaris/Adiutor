# Adiutor

Adiutor is a gadget that gives Wikipedia's a quick way of performing common maintenance tasks, such as nominating pages for deletion and cleaning up vandalism. Built using OOUI-based MediaWiki JS and JavaScript, Adiutor aims to provide users with greater convenience in performing various tasks.

## Deployment

You must have `interface-admin` rights to use the deployment script.
Visit https://meta.wikimedia.org/wiki/Special:BotPasswords to obtain credentials,
then `cp credentials.json.dist credentials.json` and change the details accordingly:

```
{
   "username": "Exampleuser@somedescription",
   "password": "mybotpassword1234567890123456789"
}
```

To deploy, run `node bin/deploy.js "[edit summary]"`.
The edit summary is transformed to include the version number and git SHA, e.g. "v5.5.5 at abcd1234: [edit summary]".

Files in the dist/unversioned/ directory must be synced manually.


# Licensing

Adiutor is licensed under the CC BY-SA 3.0 License, see the [LICENSE](./LICENSE) file included in the repository.
