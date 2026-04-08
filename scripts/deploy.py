#!/usr/bin/env python3

import requests
import os
from envsubst import envsubst 
import sys

def req_env(var_name):
    ''' 
    gets required environment variables or exits the script if any are missing
    '''
    value = os.getenv(var_name)
    if not value:
        print(f"Missing required varibles: {var_name}")
        sys.exit(1)
    return value

def main():
    #unpacking Gitlab CI varibles
    ci_project_namespace_slug = req_env("CI_PROJECT_NAMESPACE_SLUG")
    ci_project_name= req_env("CI_PROJECT_NAME")
    ci_commit_ref_slug = req_env("CI_COMMIT_REF_SLUG")
    ci_commit_ref_name = req_env("CI_COMMIT_REF_NAME")
    ci_default_branch = req_env("CI_DEFAULT_BRANCH")
    usr = req_env("PORTAINER_USR")
    pwd = req_env("PORTAINER_PWD")
    portainer_url = req_env("PORTAINER_URL")

    #Setting image tag and stack name 
    stack_name = (f"{ci_project_namespace_slug}-{ci_project_name}-{ci_commit_ref_slug}")

    if ci_commit_ref_name == ci_default_branch:
        image_tag = "latest"
    else:
        image_tag = ci_commit_ref_slug
    
    os.environ["image_tag"] = image_tag
    os.environ["stack_name"] = stack_name


    try:
        #Getting portainer json web token
        auth_post = requests.post(f"{portainer_url}/auth", json={
            "username": usr,
            "password": pwd
        })
        auth_post.raise_for_status()
        portainer_token = auth_post.json()["jwt"]
        header = {"Authorization": f"Bearer {portainer_token}"}

        #Endpoint ID 
        get_endpoint_id = requests.get(f"{portainer_url}/endpoints", headers=header)
        get_endpoint_id.raise_for_status()
        endpoint_id = next((e["Id"] for e in get_endpoint_id.json() if e["Name"] == "local-swarm"), None)

        if endpoint_id is None:
            print("No endpoint_id found")
            sys.exit(1)

        #Docker swarm ID 
        get_swarm_id = requests.get(f"{portainer_url}/endpoints/{endpoint_id}/docker/swarm", headers=header)
        get_swarm_id.raise_for_status()
        swarm_id = get_swarm_id.json()["ID"] 

        #Open and reads docker-compose file
        with open("../docker-compose.yml", "r") as f:
            compose_file = f.read()

        deployable_content = envsubst(compose_file)

        # open and writes to deployable-compose file 
        with open("deployable-compose.yml", "w") as f:
            f.write(deployable_content)

        #Getting stack in an saving it in stack_id varible
        get_stack_id = requests.get(f"{portainer_url}/stacks?endpointId={endpoint_id}", headers=header)
        get_stack_id.raise_for_status()

        match_stack_id = next((s for s in get_stack_id.json() if s["Name"] == stack_name and s["EndpointId"] == endpoint_id), None)
        stack_id = match_stack_id["Id"] if match_stack_id else None


        if not stack_id: 
            print("Creating stack...")
            with open("deployable-compose.yml", "rb") as f:
                create_stack = requests.post(f"{portainer_url}/stacks/create/swarm/file?endpointId={endpoint_id}",
                headers=header,
                data={
                "Name": stack_name,
                "SwarmID": swarm_id
                },
                files={"file": f}
                          )
            create_stack.raise_for_status()

        else:
            print(f"re-deploying stack with ID {stack_id}")
            payload = {
                "prune": True,
                "RepullImageAndRedeploy": True,
                "stackFileContent": deployable_content
            }

            deploy_stack = requests.put(f"{portainer_url}/stacks/{stack_id}?endpointId={endpoint_id}", headers=header, json=payload)
            deploy_stack.raise_for_status()

    except requests.HTTPError as e:
        print(f"HTTP error: {e}")
        if e.response is not None:
            print(f"Response: {e.response.text}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
