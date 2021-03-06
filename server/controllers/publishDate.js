'use strict';
let models = require('../models/models'),
    xml = require('xml'),
    api = require('./api');

exports.create = function(req, res) {
  api.create(req, res, models.PublishDate);
};

exports.update = function(req, res) {
  api.update(req, res, models.PublishDate);
};

exports.get = function(req, res) {
  api.findAll(req, res, models.PublishDate);
};

exports.find = function(req, res) {
  api.findOne(req, res, models.PublishDate, {
    where: { id: req.params.id }
  });
};

exports.delete = function (req, res) {
  api.delete(req, res, models.PublishDate);
};

exports.getIncompletePublishDates = function(req, res) {
  models.PublishDate.findAll({
    order: [['date', 'ASC']],
    limit: 50,
    where: {
      isDelivered: false
    },
    include: [
      models.Platform,
      {
        model: models.Lesson,
        include: [{model: models.LanguageSeries, include: [models.Language, models.Series, models.Level]}]
      }]}).then(function(publishDates) {
    if(publishDates) {
      res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates were found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getSurroundingDeliveredPublishDates = function(req, res) {
  let today = new Date();
  let earlier = new Date(today);
  let later = new Date(today);
  earlier.setDate(today.getDate()-7);
  later.setDate(today.getDate()+2);
  models.PublishDate.findAll({
    where: {
      deliveredTime: {
        $gte: earlier,
        $lte: later
      },
      isDelivered: true
    },
    include: [
      models.Platform,
      {
        model: models.Lesson,
        include: [{model: models.LanguageSeries, include: [models.Language, models.Series, models.Level]}]
      }
    ]
  }).then(function(publishDates) {
    if(publishDates) {
     res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates were found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getSurroundingUndeliveredPublishDates = function(req, res) {
  let today = new Date();
  let earlier = new Date(today);
  let later = new Date(today);
  earlier.setDate(today.getDate()-365);
  later.setDate(today.getDate()+21);
  models.PublishDate.findAll({
    where: {
      date: {
        $gte: earlier,
        $lte: later
      },
      isDelivered: false
    },
    include: [
      models.Platform,
      {
        model: models.Lesson,
        include: [{model: models.LanguageSeries, include: [models.Language, models.Series, models.Level]}]
      }
    ]
  }).then(function(publishDates) {
    if(publishDates) {
     res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates were found.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getReadyToDeliverPublishDates = function(req, res) {
  models.PublishDate.findAll({
    where: {
      isDelivered: false
    },
    include: [
      models.Platform,
      {
        model: models.Lesson,
        where: {
          filesMoved: true
        },
        include: [{model: models.LanguageSeries, include: [models.Language, models.Series, models.Level]}]
      }
    ]
  })
  .then(function(publishDates) {
    if(publishDates) {
     res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates were found.'});
    }
  })
  .catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getUpcomingPublishDatesForChannel = function(req, res) {
  models.PublishDate.findAll({
    where: {fkPlatform: 2},
    include: [
      models.Platform,
      {
        model: models.Lesson,
        include: [
          {
            model: models.LanguageSeries,
            where: {fkChannel: req.params.id},
            include: [models.Language, models.Series, models.Level]
          }
        ]
      }
    ]
  }).then(function(publishDates) {
    if(publishDates) {
      res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates were found.'});
    }
  })
  .catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getPublishDatesForLessonWithId = function(req, res) {
  models.PublishDate.findAll({
    where: {
      fkLesson: req.params.id
    },
    include: [
      models.Platform,
      {
        model: models.Lesson,
        include: [{model: models.LanguageSeries, include: [models.Language, models.Series, models.Level]}]
      }]}). then(function (publishDates) {
    if(publishDates) {
      res.send(publishDates);
    } else {
      res.status(404).send({error: 'No publish dates have been set for a lesson with this ID.'});
    }
  }).catch(function(err) {
    res.status(500).send({error: err});
  });
};

exports.getXmlForLanguageSeriesWithId = function(req, res) {
    models.PublishDate.findAll({
      where: {fkPlatform: 1, isDelivered: 1},
      include: [
        models.Platform,
        {
          model: models.Lesson,
          include: [
            {
              model: models.LanguageSeries,
              where: {id: req.params.id},
              include: [models.Language, models.Series, models.Level]
            }
          ]
        }
      ],
      order: [[models.Lesson, 'number', 'ASC']]
    }).then(function (publishDates) {
    if(publishDates) {
      let seriesXml = [
        {
          rss:[
            {
              _attr:{
                'xmlns:media':'http://search.yahoo.com/mrss/',
                'xmlns:creativeCommons':'http://backend.userland.com/creativeCommonsRssModule',
                version:'2.0'
              }
            },
            {
              channel:[
                {
                  title:publishDates            [
                    0
                  ]            .lesson.languageSery.title,
                  link:'&nbsp',
                  description:'&nbsp'
                }
              ]
            },

          ],

        },

      ];
      let thisLanguageSeries = publishDates[0].lesson.languageSery;
      let urlBase = `http://media.libsyn.com/media/${thisLanguageSeries.language.siteUrl}/${thisLanguageSeries.code}`;
      let vtmsLanguageCode = thisLanguageSeries.language.code;
      let vtmsSeriesCode = thisLanguageSeries.series.code;
      let vtmsLevelCode = thisLanguageSeries.level.code;
      let vtmsLevelNecessary = thisLanguageSeries.series.levelSignificant;
      let vtmsLanguageSeriesCode = `${vtmsLanguageCode}_${vtmsSeriesCode}`;
      if(vtmsLevelNecessary) { vtmsLanguageSeriesCode += `-${vtmsLevelCode}`; }

      for (let i = 0; i < publishDates.length; i++ ) {

        let thisLesson = publishDates[i].lesson;

        let urlFull = `${urlBase}_L${thisLesson.number}_${thisLanguageSeries.language.siteCode}_video-`;
        let paddedLessonNumber = thisLesson.number < 10 ? `0${thisLesson.number}` : thisLesson.number;
        let vtmsCode = `${vtmsLanguageSeriesCode}_${paddedLessonNumber}`;
        let rokuUrlBase = 'http://products.innovativelanguage.com/roku';
        let thumbnailUrlBase = `${rokuUrlBase}/images/thumbs/${thisLanguageSeries.language.name.toLowerCase()}/`;

        let item = {
          item:[
            {
              title:thisLesson.title
            },
            {
              guid:[
                {
                  _attr:{
                    'isPermaLink':'false'
                  }
                },
                vtmsCode
              ]
            },
            {
              description:''
            },
            {
              'media:group':[
                {
                  'media:content':[
                    {
                      _attr:{
                        'url':urlFull + 'h.mp4',
                        'bitrate':'1500',
                        'duration':thisLesson.trt,
                        'medium':'video',
                        'type':'video/quicktime'
                      }
                    }
                  ]
                },
                {
                  'media:content':[
                    {
                      _attr:{
                        'url':urlFull + 'm.mp4',
                        'bitrate':'1000',
                        'duration':thisLesson.trt,
                        'medium':'video',
                        'type':'video/quicktime'
                      }
                    }
                  ]
                },
                {
                  'media:content':[
                    {
                      _attr:{
                        'url':urlFull + 'l.mp4',
                        'bitrate':'500',
                        'duration':thisLesson.trt,
                        'medium':'video',
                        'type':'video/quicktime'
                      }
                    }
                  ]
                }
              ]
            },
            {
              'media:thumbnail':[
                {
                  _attr:{
                    'url':`${thumbnailUrlBase}${vtmsCode}-thumb.png`
                  }
                }
              ]
            }
          ]
        };

        seriesXml[0].rss[1].channel.push(item);
      }

      res.send(xml(seriesXml, true));
    } else {
      res.status(404).send({error: 'No publish dates have been set for a lesson with this ID.'});
    }
  }).catch(function(err) {
    console.log(res);
    res.status(500).send({error: err});
  });
};
