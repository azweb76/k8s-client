'use strict'

const K8sClient = require('../../');

var manifest = {
  kind: "Pod",
  metadata: {
    name: "nginx-test"
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
};

var client = new K8sClient({
  host: process.env.KUBE_HOST || '127.0.0.1:8080'
});

// client.pod.get(manifest.metadata.name, (err, rc) => {
//   if(err) return console.log(err);
//   if(rc){
//     client.pod.deleteAndWait(manifest.metadata.name, (err, rc2) => {
//       console.log(err, rc2);
//     })
//   }
// });

client.pods.deleteBySelector({
  app: 'nginx-test'
}, (err, pods) => {
  console.log(err, pods);
});

// client.pods.createAndWait(manifest, (err, pod) => {
//   console.log(err, pod);
// });
