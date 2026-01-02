export const StudioDashboard = [
    {
      "name": "container-block_6267",
      "root": true,
      "uuid": "074925c1-a345-4e3b-9e47-2ad6e292a0e0",
      "input": {
        "display": {
          "type": "string",
          "value": true
        },
        "direction": {
          "type": "string",
          "value": "horizontal"
        }
      },
      "style": {
        "fontSize": "14px",
        "box-shadow": " 0px 0px 0px 0px #000000 ",
        "border-radius": "0px",
        "justify-content": "flex-end",
        "height": "200px",
        "width": "300px"
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [
        "1a1d1c02-2d49-4480-81df-6bdb075d96e2",
        "598c4fab-9504-4717-a07c-247ae7c78985"
      ],
      "application_id": "1",
      "type": "container"
    },
    {
      "name": "Collection_6675",
      "uuid": "1a1d1c02-2d49-4480-81df-6bdb075d96e2",
      "event": {
        "onInit": "\n  fetch('/api/applications', {\n    method: 'GET',\n    headers: {\n      'Content-Type': 'application/json',\n      'Authorization': 'Bearer <your-token>', // Include if authentication is required\n    },\n  })\n    .then((response) => {\n      if (!response.ok) {\n        throw new Error(`HTTP error! status: ${response.status}`);\n      }\n      return response.json();\n    })\n    .then((data) => {\n      $apps = data;\n      return data;\n    })\n    .catch((error) => {\n      console.error('Error fetching applications:', error);\n      return null;\n    });\n} catch (error) {\n  console.error('Unexpected error:', error);\n}"
      },
      "input": {
        "data": {
          "type": "handler",
          "value": "return $apps ?? []"
        }
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [
        "6a56851f-51f5-4e0e-a087-a9ac89c06362",
        "54205cc0-e7fa-4045-aa40-26b178f2a029"
      ],
      "application_id": "1",
      "type": "collection"
    },
    {
      "name": "container-block_3589",
      "uuid": "6a56851f-51f5-4e0e-a087-a9ac89c06362",
      "input": {
        "display": {
          "type": "string",
          "value": true
        },
        "direction": {
          "type": "string",
          "value": "horizontal"
        }
      },
      "style": {
        "font-style": "normal",
        "justify-content": "flex-start"
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [
        "a0e8f605-e5ab-4a3a-a5e7-a783531ebb8e"
      ],
      "application_id": "1",
      "type": "container"
    },
    {
      "name": "text_label_265",
      "uuid": "a0e8f605-e5ab-4a3a-a5e7-a783531ebb8e",
      "input": {
        "value": {
          "type": "handler",
          "value": "return Item.name"
        }
      },
      "style": {
        "fontSize": "24px",
        "box-shadow": " 0px 0px 0px 0px #000000 ",
        "border-radius": "0px"
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [],
      "application_id": "1",
      "type": "text_label"
    },
    {
      "name": "button_input_2539",
      "uuid": "598c4fab-9504-4717-a07c-247ae7c78985",
      "input": {
        "label": {
          "type": "value",
          "value": "Add application"
        }
      },
      "style": {
        "size": "medium",
        "type": "ghost",
        "--nuraly-button-text-color": "#572020",
        "--nuraly-button-background-color": "#a13030"
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [],
      "application_id": "1",
      "type": "button_input"
    },
    {
      "name": "text_label_9634",
      "uuid": "54205cc0-e7fa-4045-aa40-26b178f2a029",
      "input": {
        "value": {
          "type": "value",
          "value": "hello"
        }
      },
      "pageId": "c81948a2-5816-4eb7-8f87-f429d0dc0562",
      "children_ids": [],
      "application_id": "1",
      "type": "text_label"
    }
  ]