# k8s client
Kubernetes client for Node.js.

> This package is under active development. Feel free to suggest new features!

```
var Client = require('k8s-client');

var client = new Client({
  host: '127.0.0.1:8080'
  });

client.pods.getBySelector({ app: 'hello-world' }, function(err, pods){
  console.log(pods);
});
```

## Installation

```
$ npm install --save k8s-client
```

## Features

* Manage all Kubernetes objects via the API.
* Get objects by label selectors.
* Scale replication controllers.
* Delete replication controllers with all pods.
* Supports token-based and client certificate authentication.

### Get objects
To get objects, create a client object and use a collections' get method.

```
...
// get all pods
client.pods.get(function(err, pods){
  console.log(pods);
});

// get a single pod
client.pods.get('pod id', function(err, pod){
  console.log(pod);
});

// get pods by label selector
client.pods.getBySelector({ app: 'hello-world' }, function(err, pods){
  console.log(pods);
});
```

### Authentication
To authenticate into a Kubernetes API, use the token or client certificate options.

*Token Authentication:*
```
var Client = require('k8s-client');

var client = new Client({
  protocol: 'https',
  host: '127.0.0.1:443',
  token: 'thisismytoken'
  });

...
```

*Certificate Authentication:*
```
var Client = require('k8s-client');

var client = new Client({
  protocol: 'https',
  host: '127.0.0.1:443',
  clientKey: fs.readFileSync('tls/k8s-client.key'),
  clientCert: fs.readFileSync('tls/k8s-client.crt'),
  caCert: fs.readFileSync('tls/k8s-ca.crt')
  });

...
```

### Creating Objects
To create an object user, the collection's `create` method.

```
...

var RC_MANIFEST = {
  kind: 'ReplicationController',
  apiVersion: 'v1',
  metadata: {
    name: 'nginx-rc',
    ...
  }
}

client.replicationControllers.create(RC_MANIFEST, function(err, rc){
  console.log('created nginx replication controller', rc)
});
```

### Scaling
To scale a replication controller, call the `scale` or `scaleAndWait` methods.

```
...

// scale a replication controller without waiting
client.replicationControllers.scale('my-rc', 10, function(err, rc){
  console.log('scaled rc', rc);
});

// scale a replication controller and wait for all pods to report Ready
client.replicationControllers.scaleAndWait('my-rc', 10, function(err, rc){
  console.log('scaled rc', rc);
});

```

### Deleting objects
To delete objects, call the `delete` method on the collection.

```
...

// delete a pod
client.pod.delete('my-pod', function(err, pod){
  console.log('deleted pod', pod);
  });

// delete a replication controller and it's pods
client.replicationControllers.deleteWithPods('my-rc', function(err, rc){
  console.log('deleted rc with pods', rc);
});
```
