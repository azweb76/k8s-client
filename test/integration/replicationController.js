'use strict'

const K8sClient = require('../../');

var manifest = {
  id: "nginxController",
  kind: "ReplicationController",
  metadata: {
    name: "nginx-test"
  },
  spec: {
    replicas: 1,
    selector: {
      app: "nginx-test"
    },
    template: {
      metadata: {
        name: "nginx-test",
        labels: {
          app: "nginx-test"
        }
      },
      spec: {
        containers: [
          {
            name: "nginx-test",
            image: "nginx",
            ports: [
              { containerPort: 80 }
            ]
          }
        ]
      }
    }
  }
};

var client = new K8sClient({
  host: process.env.KUBE_HOST || '127.0.0.1:8080'
});

// client.replicationControllers.get(manifest.metadata.name, (err, rc) => {
//   if(err) return console.log(err);
//   if(rc){
//     client.replicationControllers.deleteAndWait(manifest.metadata.name, (err, rc2) => {
//       console.log(err, rc2);
//     })
//   }
// });

client.pods.createAndWait(manifest, (err, rc) => {
  console.log(err, rc);
});

// client.replicationControllers.deleteBySelectorAndWait({
//   app: 'nginx-test'
// }, (err, rc) => {
//   console.log(err, rc);
// });
