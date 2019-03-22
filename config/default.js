module.exports = {
  "Redis": {
    "mode": "", //instance, cluster, sentinel
    "ip": "",
    "port": 0,
    "user": "",
    "password": "",
    //"db": 9,
    "sentinels": {
      "hosts": "",
      "port": 0,
      "name": ""
    }
  },

  "Mongo": {
    "ip": "",
    "port": "",
    "dbname": "",
    "password": "",
    "user": "",
    "cloudAtlas": true
  },

  "Security": {
    "ip": "",
    "port": 0,
    "user": "",
    "password": "",
    "mode": "", //instance, cluster, sentinel
    "sentinels": {
      "hosts": "",
      "port": 0,
      "name": ""
    }
  },

  "Host": {
    "resource": "",
    "vdomain": "",
    "domain": "",
    "port": "",
    "version": ""
  },

  "LBServer": {
    "ip": "",
    "port": ""
  },

  "RabbitMQ": {
    "ip": '',
    "port": "",
    "user": "",
    "password": "",
    "vhost": '/'
  },

  "Services": {
    "accessToken": ""
  },

  "UseDashboardAMQP": "true"
};