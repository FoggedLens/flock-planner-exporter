# Flock Planner Exporter

![screenshot of the Flock Planner Exporter extension](images/export-tool.png)

This is a simple Chrome extension to restore export functionality to the Flock Planner tool.

For some reason, Flock has removed the ability to export plans from the Flock Planner tool. This extension adds a new **Export** button to the Flock Planner tool that allows you to export the current plan to a CSV file.

### What is the Flock Planner tool?

The Flock Planning Center is a tool Flock created to allow their customers to manage their deployments of ALPRs. The URLs are difficult to obtain since they're [UUIDs](https://en.wikipedia.org/wiki/Universally_unique_identifier), but they can typically be found using [Google dorking](https://en.wikipedia.org/wiki/Google_hacking) or FOIA requests.

Their URL structure is typically `https://planner.flocksafety.com/public/<UUID>`.

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable Developer Mode
4. Click "Load unpacked" and select the directory where you cloned this repository

## Usage

This extension will activate on the Flock Planner tool. When you are on the Flock Planner tool, you will see a new **Export** button in the top-left corner of the screen. Click this button to export the current plan to a CSV file.
