# Trello-Telegram Integration Bot

## Overview

The Trello-Telegram Integration Bot is a powerful tool designed to streamline project management tasks. It bridges the gap between your Trello account and your Telegram group, enabling seamless communication and task tracking. This README provides an overview of the bot's purpose and how to use it.

## Purpose

The primary purpose of this bot is to provide real-time updates on card movements within Trello boards to a designated Telegram group. Additionally, it offers a convenient way to generate reports on the tasks of group members. The bot simplifies the following key tasks:

1. **Linking Trello and Telegram Accounts:** Users can link their Telegram accounts with their Trello accounts, allowing the bot to access Trello data.

2. **Real-time Card Movement Notifications:** The bot automatically sends notifications to the Telegram group whenever a card is moved between Trello columns. This keeps all group members informed about the project's progress.

3. **Generating Task Reports:** Users can request a report by simply clicking the "Report" button. The bot will provide an overview of the tasks each group member currently has in progress.

## How to Start Locally

Make sure you have Node.js v19+ and pnpm installed on your machine.

1. Clone the repository.
2. Specify the .env file in the src/common/envs directory (you can use the .env.example file in this directory as an example).
3. From the project's root directory, run the following commands:
   - To build the project locally:
     ```
     pnpm run build:local
     ```
   - To start the local server:
     ```
     pnpm run start:local
     ```
