module.exports = {
    "Redis": {
        "mode": "SYS_REDIS_MODE",
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }
    },

    "Security": {
        "ip": "SYS_REDIS_HOST",
        "port": "SYS_REDIS_PORT",
        "user": "SYS_REDIS_USER",
        "password": "SYS_REDIS_PASSWORD",
        "mode": "SYS_REDIS_MODE",
        "sentinels": {
            "hosts": "SYS_REDIS_SENTINEL_HOSTS",
            "port": "SYS_REDIS_SENTINEL_PORT",
            "name": "SYS_REDIS_SENTINEL_NAME"
        }
    },

    "Mongo": {
        "ip": "SYS_MONGO_HOST",
        "port": "SYS_MONGO_PORT",
        "dbname": "SYS_MONGO_DB",
        "password": "SYS_MONGO_PASSWORD",
        "user": "SYS_MONGO_USER",
        "cloudAtlas": "SYS_MONGO_CLOUDATLAS"
    },

    "Host": {
        "vdomain": "LB_FRONTEND",
        "domain": "HOST_NAME",
        "port": "HOST_CLUSTERCONFIGURATION_PORT",
        "version": "HOST_VERSION"
    },

    "LBServer": {
        "ip": "LB_FRONTEND",
        "port": "LB_PORT"
    },

    "RabbitMQ": {
        "ip": '45.55.142.207',
        "port": "5672",
        "user": "admin",
        "password": "admin",
        "vhost": '/'
    },

    "SMOOTHFLOW": {
        "host": "SF_HOOK"
    },

    "Services": {
        "accessToken": "GLOBAL_TOKEN"
    }
};

//NODE_CONFIG_DIR