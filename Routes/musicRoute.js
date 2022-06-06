let express = require('express');
let musicRouter = express.Router();

//maak gebruik van comments bij elke functie of declaratie

let routes = function (Album) {
    let musicController = require('../Controllers/musicController.js')(Album);

    musicRouter.route('/')
        .options(function (req, res) {
            res.set('Allow', 'GET,OPTIONS,POST');
            res.end();
        })
        .post(musicController.post)

        .get(musicController.get);

    musicRouter.use('/:albumId', function (req, res, next) {
        Album.findById(req.params.albumId, function (err, album) {
            if (err) {
                res.status(500).send(err);
            } else if (album) {
                req.album = album;
                next();
            } else {
                res.status(404).send('Album not found');
            }
        });
    });

    musicRouter.route('/:albumId')
        .get(function (req, res) {

            let returnAlbum = req.album.toJSON();
            returnAlbum._links = {};
            returnAlbum._links.self = {};
            returnAlbum._links.self.href = 'http://' + req.headers.host + '/api/albums/' + returnAlbum._id;
            returnAlbum._links.collection = {};
            returnAlbum._links.collection.href = 'http://' + req.headers.host + '/api/albums/';

            res.json(returnAlbum);
        })

        .put(function (req, res) {

            let requiredFields = ['title', 'artist', 'year', 'tracks'];
            let error = false;

            for (let i = 0; i < requiredFields.length; i++) {
                if (req.body[requiredFields[i]] === undefined || req.body[requiredFields[i]] === '') {
                    error = true;
                }
            }

            if (!error) {
                req.album.title = req.body.title;
                req.album.artist = req.body.artist;
                req.album.tracks = req.body.tracks;
                req.album.year = req.body.year;
                //req.album.favourite = req.body.favourite;

                if (req.headers['content-type'] === 'application/json') {
                    req.album.save(function (err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            let returnAlbum = req.album.toJSON();
                            returnAlbum._links = {};
                            returnAlbum._links.self = {};
                            returnAlbum._links.self.href = 'http://' + req.headers.host + '/api/albums/' + returnAlbum._id;
                            returnAlbum._links.collection = {};
                            returnAlbum._links.collection = 'http://' + req.headers.host + '/api/albums/';
                            res.json(returnAlbum);
                        }
                    });
                } else {
                    res.status(400).json({'message': 'Headers are incorrect'});
                }
            } else {
                console.log("hello");
                res.status(415).json({'message': 'Unsupported format: */*'});
            }
        })

        .patch(function (req, res) {
            if (req.body._id) {
                delete req.body._id;
            }
            for (let p in req.body) {
                req.album[p] = req.body[p];
            }

            req.album.save(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json(req.album);
                }
            });
        })
    
    //kan de delete niet in een ander bestand als class? Dan heb je namelijk OOP gebruikt.
        .delete(function (req, res) {
            req.album.remove(function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(204).send('Album was removed')
                }
            });
        })
        .options(function (req, res) {
            res.set('Allow', 'GET,OPTIONS,PUT,PATCH,DELETE');
            res.end();
        });

    return musicRouter;
};

module.exports = routes;
