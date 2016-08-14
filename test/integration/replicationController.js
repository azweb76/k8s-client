'use strict'

const K8sClient = require('../../');
const fs = require('fs');

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
  url: process.env.KUBE_URL || 'http://127.0.0.1:8080',
  clientKey: fs.readFileSync(process.env.KUBE_CLIENT_KEY || '/etc/pki/tls/private/k8s-client.key'),
  clientCert: fs.readFileSync(process.env.KUBE_CLIENT_CERT || '/etc/pki/tls/certs/k8s-client.crt'),
  caCert: fs.readFileSync(process.env.KUBE_CA_CERT || '/etc/pki/tls/certs/ca.crt')
});

// client.replicationControllers.get(manifest.metadata.name, (err, rc) => {
//   if(err) return console.log(err);
//   if(rc){
//     client.replicationControllers.deleteAndWait(manifest.metadata.name, (err, rc2) => {
//       console.log(err, rc2);
//     })
//   }
// });

client.pods.get((err, rc) => {
  console.log(err, rc);
});

// client.replicationControllers.deleteBySelectorAndWait({
//   app: 'nginx-test'
// }, (err, rc) => {
//   console.log(err, rc);
// });
