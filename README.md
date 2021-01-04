# Microservices-udacity-project3 [![Build Status](https://travis-ci.com/sdkdeepa/microservices-udacity-project3.svg?branch=main)](https://travis-ci.com/sdkdeepa/microservices-udacity-project3)

Steps to perform this project

1. Clone the project - https://github.com/sdkdeepa/Udacity-project3-starter-N-solution/blob/master/project/
2. To Run locally: 
      - run   `npm i`
      - `npm start`
2. Create docker images for front, backend feed, user, frontend and reverse proxy
      - `docker build -t <docker local repor name> .`  
      - `docker tag <local repo> <docker hub name>` 
      - `docker push <docker hub name> `
   examples:
      ![Docker images](https://github.com/sdkdeepa/microservices-udacity-project3/blob/main/screenshots/docker%20images.png)
3. Docker decompose to run the project in local machine
      ![docker terminal image](https://github.com/sdkdeepa/microservices-udacity-project3/blob/main/screenshots/Docker%20images%20terminal.png)
4. Create EKS cluster and node group
      ![AWS-EKS-nodegroup]

5. Connect your deployment files to k8s
      - `aws eks --region <region> update-kubeconfig --name <name of the cluster>`
      
6. Run all the yaml files from k8s prject file
      - `kubectl apply -f .`
      - `kubectl get all`
      - `kubectl port-forward service/frontend 8100:8100` use new tab on the terminal
      - `kubectl port-forward service/reverseproxy 8080:8080` use new tab on the terminal
      
    ![AWS-k8s-nodegroup-pods](https://github.com/sdkdeepa/microservices-udacity-project3/blob/main/screenshots/k8s-pods.png)
7. Sync the project with Travis CI by selecting the github repo
8. Create all the Environmental variables in the repo settings of travis
9. Trigger build
10. Once your application builds successfully in travis, you have connected your project to CI CD pipeline!
![travis-build passing](https://github.com/sdkdeepa/microservices-udacity-project3/blob/main/screenshots/Travis-Build-Pass.png)
![Frontend](https://github.com/sdkdeepa/microservices-udacity-project3/blob/main/screenshots/localhost8100.png)
  
### Reference: https://blog.juadel.com/2020/05/15/create-a-kubernetes-cluster-in-amazon-eks-using-a-reverse-proxy/
