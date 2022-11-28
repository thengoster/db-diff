# db-diff

# Assumptions
One large assumption I made was that the primary key would remain static, meaning the primary key's name would be "id" with type string. It seemed cumbersome
to actually extract the primary key programmatically, but given more time, I believe it could be achieved. The assumption that the primary key is a string also
played a role in how I sorted the records, as I ignored the possibility of another table possibly having a primary key being of type num and did not include
the sorting logic for numbers.

# Obstacles
I ran into many minor obstacles that bogged me down while I was writing the programs, including but not limited to: time, testing, and mocking.
1 week should be enough time to complete the assignment, but I found it quite difficult to accommodate time due to working weekends as well as the Thanksgiving
holiday occurring last week. If I could start on the assignment again from the beginning, I would definitely try to carve out a few more minutes here and there every day
in order to reduce my overall confusion during software development and possibly complete the assignment earlier. 
It was also clear to me how rusty I was with nodejs testing, as I ran into a few technical roadblocks in my understanding of how mocking works with Jest. In addition
to mocking, I did not have time to work through how to test my preprocess.js function properly due to having limited experience with database mocking / interaction.
If I were to rework my plan of attack for testing with Jest, I would have read substantially more documentation on Jest mocking and possible ways to test my 
preprocess() function to have a full understanding of how to implement these, rather than a partial understanding that resulted in many bugs needing to be squashed. 

# Documentation for program setup
For windows local machine:

*** Install and run Docker container ***

Install Docker Desktop
In a local terminal, create a docker volume using:
  docker volume create sharedVol
Run our container with the volume, which will contain all of our program code.
  docker run -p 5432:5432 -v sharedVol:/sharedVol guaranteedrate/homework-pre-migration:1607545060-a7085621
Using a shared volume, we can preprocess the data from both containers and then use that to generate our report.

Enter the container itself in a terminal (I use a vscode extension to remotely connect to the container) or through the docker desktop built-in terminal itself, where we can now in the docker container:
cd /sharedVol

*** Install node and npm ***

apt update
apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install node
nvm install-latest-npm

*** Clone git repo ***

git clone https://github.com/thengoster/db-diff.git

*** How to use ***

cd to db-diff repo, so in this example:
  cd /sharedVol/db-diff
To preprocess records from a docker container:
  node preprocess.js
You will need to run this once for each container (old and new) to generate files named "old" and "new", respectively

To generate the report, which can be found in report.txt:
  node reportGenerator.js
  
To run test cases:
  npm test
  
