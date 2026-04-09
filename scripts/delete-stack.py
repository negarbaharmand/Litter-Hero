#!/usr/bin/env python3

import requests
import sys
from deploy import req_env 

def main():
    #unpacking Gitlab CI varibles
    ci_project_name= req_env("CI_PROJECT_NAME")
    ci_commit_ref_slug = req_env("CI_COMMIT_REF_SLUG")
    usr = req_env("PORTAINER_USR")
    pwd = req_env("PORTAINER_PWD")
    portainer_url = req_env("PORTAINER_URL")

    try:
        #Getting portainer json web token
        auth_post = requests.post(f"{portainer_url}/auth", json={
            "username": usr,
            "password": pwd
        })

        auth_post.raise_for_status()
        portainer_token = auth_post.json()["jwt"]
        header = {"Authorization": f"Bearer {portainer_token}"}
        stack_name = (f"{ci_project_name}-{ci_commit_ref_slug}")
        

        get_endpoint_id = requests.get(f"{portainer_url}/endpoints", headers=header)
        get_endpoint_id.raise_for_status()
        endpoint_id = next((e["Id"] for e in get_endpoint_id.json() if e["Name"] == "local-swarm"), None)

        if endpoint_id is None:
            print("No endpoint_id found")
            sys.exit(1)
        

        get_stack_id = requests.get(f"{portainer_url}/stacks?endpointId={endpoint_id}", headers=header)
        get_stack_id.raise_for_status()
        match_stack_id = next((s for s in get_stack_id.json() if s["Name"] == stack_name and s["EndpointId"] == endpoint_id), None)
        stack_id = match_stack_id["Id"] if match_stack_id else None

        if stack_id is None:
            print("No stack to delete")
            sys.exit(0)


        print(f"Deleting the stack named: {stack_name} with stack id: {stack_id}")
        deleting_stack = requests.delete(f"{portainer_url}/stacks/{stack_id}?endpointId={endpoint_id}", headers=header)
        deleting_stack.raise_for_status()


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
