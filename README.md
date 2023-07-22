# Discord Application Bot

![image](https://github.com/JuanDelPueblo/discord-application-bot/assets/49998039/3e092d36-ff01-4c4b-8aa5-be1c5dca8722)


Create forms, receive applications, and choose who to approve, all within your own Discord server. Each form is managed in a single channel where the applications are answered inside threads.

## Key Features

* Seamless integration: Utilizes many of Discord's native features such as, modals, selection boxes, and autocompleteable commands for the best experience possible.
* Diverse question types: Accommodate various types of data inputs including text, numeric values, multiple-choice selections, and file attachments.
* Application management: Control who will be approved or rejected, while enabling actions such as role assignment, kicking, and sending messages to specific channels.
* Access control: Define permissions to regulate who can view and execute actions on forms, ensuring secure and authorized handling of application data.
* Streamlined data export: Extract all form applications and compile them into a convenient .csv spreadsheet format for further analysis and record-keeping.

## Installation

1. Install Node.js (recommended version 18 or newer, bot was developed on version 18.16.0)
2. Clone this repository
3. In a terminal inside the repository directory, run the command `npm install` to install all the required dependencies
4. Run the command `npm run start` once, it will generate the config.json file and prompt you to configure the token and client ID of the bot in the `config.json` file.
5. Once configured, run `npm run start` again to start the bot.
6. Invite the bot to your server and start using it!

## Usage

To create a form, use the `/form setup` command in a text channel to create a form. It will prompt you for the title, and optionally a description and alternate button label. Once done, you may use the following commands to configure the form. 

* `/action` - Manage the actions to take on approval or rejection of an application. Actions include adding/removing roles, banning/kicking the user, send a message to a channel, DM the user, or delete the application entirely instead of archiving it. 
* `/question` - Manages the questions that will be asked on an applicattion. The four main types of questions include text, number, selection, and file attachment. Questions can be set to be required or have a minimum/maximum value requirement depending on the type of question.
* `/role` - Manages which roles has permission to view or approve/reject an application.

Once you are happy with the configuration, the last command needed to be run is `/form submit True` to enable form submissions. This process can then be repeated for any other forms you wish to setup.
