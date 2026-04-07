#!/usr/bin/env python3

import requests
from requests.auth import HTTPBasicAuth
import os
from dotenv import load_dotenv
from envsubst import envsubst 

load_dotenv(dotenv_path="../.env")

if __name__ == "__main__":
    portainer_url= "https://portainer.doe25.swarm.chas-lab.dev/api"

    auth_post = requests.post(f"{portainer_url}/auth", json={
        "username": os.getenv("PORT_USR"),
        "password": os.getenv("PORT_PWD")
    })

    portainer_token = auth_post.json()["jwt"]

    #stack_name = f"{CI_PROJECT_NAMESPACE_SLUG}-{CI_PROJECT_NAME}-{CI_COMMIT_REF_SLUG}"
    #print(stack_name)

    #Endpoint ID 
    get_endpoint_id = requests.get(f"{portainer_url}/endpoints",
                                   headers={"Authorization": f"Bearer {portainer_token}"
                                            })
    endpoint_id = get_endpoint_id.json()[0]["Id"]
    print(f"Endpoint id is: {endpoint_id}")


    #Docker swarm ID 
    get_swarm_id = requests.get(f"{portainer_url}/endpoints/{endpoint_id}/docker/swarm", 
                                headers={"Authorization": f"Bearer {portainer_token}"
                                         })
    swarm_id = get_swarm_id.json()["ID"] 
    print(f"Swarm cluster: {swarm_id}")


    #IMAGE TAG
    if $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH:
        image_tag = latest
    else:
        image_tag = $CI_COMMIT_REF_NAME
    
    stack_id = requests.get(f"{portainer_url}/stacks",
                            headers={"Authorization": f"Bearer {portainer_token}"
                                     })
    if not stack_id: 
        print("Create stack")
