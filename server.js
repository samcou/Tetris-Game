
const cors = require('cors')
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express()
const port = 3000

const db = new sqlite3.Database('scoreboard.sqlite')

app.use(express.json());
app.use(cors())

app.post('/submit-score', (req, res) => {
     const playerName = req.body.playerName;
  const score = req.body.score;


      // Insert the submitted data into the leaderboard table
  db.run('INSERT INTO scoreboard (name, score) VALUES (?, ?)', [playerName, score], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
        
      return;
    }

    res.send('Score submitted successfully');
  });
  });


  app.get('/scoreboard', (req, res) => {
    db.all('SELECT * FROM scoreboard ORDER BY score DESC', (err, rows) => {
      if (err) {
        console.log("error4")

        console.error(err);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      res.json(rows);
    });
  });

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  // Serve static files from the "public" directory
app.use(express.static('public'));
