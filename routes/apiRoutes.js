var db = require('../models');
var axios = require('axios');
var cheerio = require('cheerio');

module.exports = function(app) {
  //Get route initiated through link click("Scape") to pull Headlines from Website
  app.get('/scrape', function(req, res) {
    var url = 'https://old.reddit.com';
    axios.get(url + '/r/aww/').then(function(response) {
      // Load the HTML into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(response.data);
      // An empty array to save the data that we'll scrape
      var results = [];
      var result = {};

      // With cheerio, find each p-tag with the "title" class
      // (i: iterator. element: the current element)
      $('p.title').each(function(i, element) {
        result = {};
        // Save the text of the element in a "title" variable
        result.title = $(element).text();
        console.log('Grabbed Link');

        if (
          $(element)
            .children()
            .attr('href')
            .startsWith('http')
        ) {
          result.link = $(element)
            .children()
            .attr('href');
        } else {
          result.link =
            url +
            $(element)
              .children()
              .attr('href');
        }

        if (
          $(element).parent().parent().parent().find('img').attr('src') != undefined
        ) {
          result.img = $(element)
            .parent()
            .parent()
            .parent()
            .find('img')
            .attr('src');
        } else {
          result.img = "//b.thumbs.redditmedia.com/ISkqazzioofLwnMi8_k9-42BJxW3XeU4EiazfOZjv8o.jpg"
        }
        // Make an object with data we scraped for this h4 and push it to the results array
        results.push({
          result
        });

        // Save these results in an object that we'll push into the results array we defined earlier
        db.Article.create(result)
          .then(function(dbArticle) {
            console.log('Article Scrapped');
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            if (err.code === 11000) {
              console.log('Duplicate Entry');
            } else {
              res.json(err);
              JSON.stringify(randomElement);
            }
          });
      });
      // Log the results once you've looped through each of the elements found with cheerio
      console.log(results);
      res.redirect('/articles');
      res.finished = true;
    });
  });

  //Route to pull articles from db
  app.get('/articles', function(req, res) {
    // Grab every document in the Articles collection
    var data = {};

    db.Article.find({})
      .then(function(dbArticles) {
        // If we were able to successfully find Articles, send them back to the client
        data.articles = dbArticles;
        res.render('index', data);
        console.log('Articles pulled from database');
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  //Route to pull saved articles from db
  app.get('/saved', function(req, res) {
    // Grab every document in the Articles collection
    var data = {};

    db.Article.find({ isSaved: true })
      .populate('note')
      .then(function(dbArticles) {
        // If we were able to successfully find Articles, send them back to the client
        data.article = dbArticles;
        res.render('saved', data);
        console.log('Article Saved');
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get('/', function(req, res) {
    res.redirect('/articles');
  });

  app.post('/save/:id', function(req, res) {
    var thisId = req.params.id;

    db.Article.findOneAndUpdate(
      { _id: thisId },
      {
        $set: { isSaved: true }
      },
      function(err) {
        if (err) {
          res.json(err);
        } else {
          console.log('Updated To Saved');
        }
      }
    );
    
    console.log('Saved');
  });

  //Unsave an article
  app.post('/unsave/:id', function(req, res) {
    var thisId = req.params.id;

    db.Article.findOneAndUpdate(
      { _id: thisId },
      {
        $set: { isSaved: false }
      },
      function(err) {
        if (err) {
          res.json(err);
        } else {
          console.log('Updated To Saved');
        }
      }
    );
    
    console.log('Saved');
  });

  app.get('/article/:id', function(req, res) {
    var thisId = req.params.id;

    var data = [];

    db.Article.find({ _id: thisId })
      .then(function(dbArticle) {

        data.article = dbArticle;
        res.render('article', data);
      })
      .catch(function(err) {

        res.json(err);
      });
  });

  //Button
  app.post('/addNote/:id', function(req, res) {
    var articleId = req.params.id;

    db.Note.create(req.body)
      .then(function(note) {

        console.log('Note Created');
        return db.Article.findOneAndUpdate(
          { _id: articleId },
          { $push: { note: note._id } }
        );
      })
      .catch(function(err) {

        res.json(err);
      });
      res.redirect('/saved')
  });

  //Delete Note
  app.get('/delete/:id', function(req, res) {
    // Remove a note using the objectID
    db.Note.remove(
      {
        _id: req.params.id
      },
      function(error, removed) {

        if (error) {
          console.log(error);
          res.send(error);
        } else {

          console.log('Note Removed');

        }
      }
    );
  });
};
