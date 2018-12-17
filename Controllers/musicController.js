let musicController = function(Album) {
    let post = function(req, res) {
        let items;

        if (req.body.items !== undefined) {
            items = req.body.items;
        } else {
            items = req.body;
        }

        let album = new Album(items);
        console.log("body");
        console.log(items);
        console.log("end body");
        let requiredFields = ["title", "artist", "year", "tracks"];
        let error = false;

        for (let i = 0; i < requiredFields.length; i++) {
            console.log(requiredFields[i] + " - " + items[requiredFields[i]]);
            if (
                items[requiredFields[i]] === undefined ||
                items[requiredFields[i]] === ""
            ) {
                error = true;
            }
        }

        if (error) {
            res.status(422).send("Vul meer gegevens in");
        } else {
            album.save();

            res.status(201);
            res.send(album);
        }
    };

    let get = function(req, res) {

        let collection = {};
        let query = {};

        if (req.query.genre) {
            query.genre = req.query.genre;
        }

        // pagination waardes opvragen
        // req.body.start
        let start = 1;

        if(req.query.start) {
            start = parseInt(req.query.start);
        }

        // req.body.limit
        let limit = 1000000;
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }


        Album.find(query, function(err, albums) {
            if (err) res.status(500).send(err);
            else {

                collection.items = [];
                let collectionLink = 'http://' + req.headers.host + '/api/albums';

                let counter = 0;

                albums.forEach(function (element) {

                    counter++;
                    let newAlbum = element.toJSON();
                    newAlbum._links = {};
                    newAlbum._links.self = {};
                    newAlbum._links.self.href = 'http://' + req.headers.host + '/api/albums/' + newAlbum._id;
                    newAlbum._links.collection = {};
                    newAlbum._links.collection.href = collectionLink;

                    if ((counter >= start) && (collection.items.length < limit)) {
                        collection.items.push(newAlbum);
                    }

                });

                collection._links = {};
                collection._links.self = {};
                collection._links.self.href = collectionLink;

                collection.pagination = {};
                collection.pagination.currentItems = collection.items.length;
                collection.pagination.currentPage = Math.ceil(start / limit);
                collection.pagination.totalItems = albums.length;
                collection.pagination.totalPages = Math.ceil(albums.length / limit);

                collection.pagination._links = {};
                collection.pagination._links.first = {};

                collection.pagination._links.first.page = 1;
                collection.pagination._links.first.href = 'http://' + req.headers.host + '/api/albums?limit=' + limit;

                collection.pagination._links.last = {};
                collection.pagination._links.last.page = collection.pagination.totalPages;
                collection.pagination._links.last.href = 'http://' + req.headers.host + '/api/albums?start=' + (albums.length - limit + 1) + '&limit=' + limit;

                collection.pagination._links.previous = {};
                if (collection.pagination.currentPage > 1) {
                    collection.pagination._links.previous.page = collection.pagination.currentPage - 1;
                    collection.pagination._links.previous.href = 'http://' + req.headers.host + '/api/albums?start=' + (start - limit) + '&limit=' + limit;
                } else {
                    collection.pagination._links.previous.page = 1;
                    collection.pagination._links.previous.href = 'http://' + req.headers.host + '/api/albums?limit=' + limit;
                }

                collection.pagination._links.next = {};
                if (collection.pagination.currentPage < collection.pagination.totalPages) {
                    collection.pagination._links.next.page = collection.pagination.currentPage + 1;
                    collection.pagination._links.next.href = 'http://' + req.headers.host + '/api/albums?start=' + (start + limit) + '&limit=' + limit;
                } else {
                    collection.pagination._links.next.page = collection.pagination.totalPages;
                    collection.pagination._links.next.href = 'http://' + req.headers.host + '/api/albums?start=' + (albums.length - limit + 1) + '&limit=' + limit;
                }

                res.json(collection);

            }
        });
    };


    return {
        post: post,
        get: get
    };
};
module.exports = musicController;
