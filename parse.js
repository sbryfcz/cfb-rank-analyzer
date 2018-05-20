const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');

const inputDirectory = "output-scraped";

const files = fs.readdirSync(inputDirectory);

var teamRankings = [];

files.map(file => {
    var year = +file.substr(0, 4);

    // read the contents
    var html = fs.readFileSync(inputDirectory + '/' + file, { encoding: 'utf-8' });

    // parse the html
    const $ = cheerio.load(html);

    // convert to csv
    var rows = $('tbody tr');

    rows.each((index, row) => {
        var $row = $(row);

        const week = $row.find('[data-stat="date_poll"]').text();

        if (week !== 'Final' && week !== 'Preseason') {
            return;
        }

        const rank = $row.find('[data-stat="rank"]').text();
        let team = $row.find('[data-stat="school_name"]').text();
        team = _.trimEnd(team.split('(')[0]);

        let conference = $row.find('[data-stat="conf_abbr"]').text();

        // remove the division
        conference = _.trimEnd(conference.split('(')[0]);

        const teamRanking = {
            year: year,
            week: week,
            conference: conference,
            team: team,
            rank: +rank
        };

        teamRankings.push(teamRanking);
    });
});

fs.writeFileSync('team-rankings.json', JSON.stringify(teamRankings, null, 4));



