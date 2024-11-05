The goal of our AI assistant, named PatternPartner, is to analyze logs from running programs (such as Network Packages, Docker Outputs, and System Calls) and identifying architectural patterns within software systems, helping developers to know the current design and system optimizations implemented, making room for thoughts on what is right and wrong, and how to improve them.

# Vision

Our product is aimed at developers that want to enhance their software architecture analysis process, making it easier to understand the underlying architectural patterns in their systems. This makes it possible for developers to ensure that they align with best practices estabilished in the market and makes it easier to make decisions on how what to improve from the current status.

To achieve this objective, artificial intelligence is used through Google's Gemini API. For each log analyzed, there will be a division in subcategories that match the patterns found by the LLM, all of which will contain a general description. This is important to keep in mind, since the LLM will not be analyzing in-depth each and every scenario, for that would require more than the free-to-use plan of this API.

PatternPartner, although meant to be used mainly by developers, can also be used by students or curious tech-people that want to have a general look at a given program architectural structure. This is made possible since the logic behind the analysis is not required to be understood to retrieve valuable information from this assistant, making it easier to get useful information even for those who lack knowledge or experience.

# Domain Analysis
* Log Collector: Handles various log types (Network Packages, Docker Outputs, System Calls).
* Pattern Detector: Runs the AI model for pattern detection based on input logs.
* Pattern Catalog: Subdivision of the results according to categories established in literature (such as POSA4).
* Report Generator: Prepares analysis results in Markdown format (both for direct visualization and download to keep this information stored).

# Architecture & Design
Our AI assistant is built based on a layered approach which divides the functionalities into 3 major fields:
* Data Collection Layer: Accepts logs given by the users from multiple sources.
* Analysis Layer: Powered by Google's Gemini LLM, this layer will be responsible for the detection of architectural patterns.
* Output Layer: Formats the result into a Markdown file and presents them to the user.

# Technologies
PatternPartner uses Node.js for the backend and React for the frontend, making it easier to integrate the LLM with a web application interface, enabling users to interact with the system through a modern, responsive UI. The main technology stack includes:

Backend (Node.js):
* Log Collection: enables users to input the logs from their running programs and prepares them to be sent to the LLM.
* Pattern Detection: performs pattern detection based on the given logs through the use of Gemini API.
* Output: formats the analysis output results in Markdown to enable a smooth and easy reading.

Frontend (React):
* User Interface: a responsive and user-friendly UI for inserting logs and starting the execution of the process with the click of a button.
* Data Output: the output will be displayed to the user in the format of a Markdown file, ready for download with a single click of a button that allows the user to keep track of this information locally.
* Data Certainty Visualization: an indicator will be displayed that informs the user of the level of certainty the LLM has about the given output.

## Prototype

The initial prototype in Sprint 0 integrated basic log analysis from a given log input and initial contextualization given to the LLM, and the pattern detection was made through the use of OpenAI LLM. For result display, the LLM output was formatted as a Markdown file that contained the categories of architectural patterns detected and their general description.
With more research made, the transition to Gemini LLM was found necessary due to stricter limitations of the free-to-use OpenAI API.

This prototype made it possible to see the need for automation and user-friendly use of this tool, since having to always contextualize the LLM manually and letting it know how the output should be made can become tedious and complicated. By automating this, not only it is less error-prone, but also gives the user more free time to focus on other important aspects of their field.

# Development guide

Explain what a new developer to the project should know in order to develop the system, including who to build, run and test it in a development environment.
Document any APIs, formats and protocols needed for development (but don't forget that public APIs should also be accessible from the "How to use" above).
Describe coding conventions and other guidelines adopted by the team(s).

# Security concerns
Identify potential security vulnerabilities classes and explain what the team has done to mitigate them.

# Quality assurance
Describe which tools are used for quality assurance and link to relevant resources. Namely, provide access to reports for coverage and mutation analysis, static analysis, and other tools that may be used for QA.

# How to use
Explain how to use your tool from an user standpoint. This can include short videos, screenshots, or API documentation, depending on what makes sense for your particular software and target users. If needed, link to external resources or additional markdown files with further details (please add them to this wiki).

# How to contribute
Explain what a new developer should know in order to develop the tool, including how to build, run and test it in a development environment.
Defer technical details to the technical documentation below, which should include information and decisions on architectural, design and technical aspects of the tool.

# Contributions
Link to the factsheets of each team and of each team-member:
Team 4
* [Daniel Nunes](https://github.com/FEUP-MEIC-DS-2024-25/ai4sd/wiki/factsheets/daniel_nunes.md) (PO)
* [Henrique Caridade](https://github.com/FEUP-MEIC-DS-2024-25/ai4sd/wiki/factsheets/henrique_caridade.md) (SM)
* [Pedro Pinto](https://github.com/FEUP-MEIC-DS-2024-25/ai4sd/wiki/factsheets/pedro_pinto.md)
* [Rui Martins](https://github.com/FEUP-MEIC-DS-2024-25/ai4sd/wiki/factsheets/rui_martins.md)
