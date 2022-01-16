# 236369-FullStack-FinalProject

- [Ofir Shechtman](https://github.com/Ofir-Shechtman)
- [Ben Lugasi](https://github.com/benlugasi)

## Installation


Clone the repository and change into its directory.

```
$ git clone git@github.com:Ofir-Shechtman/236369-FullStack-FinalProject.git
$ cd 236369-FullStack-FinalProject
```

Create a virtual environment and activate it. This is where dependencies for the project will be installed.
******************
- Using Conda
```
$ conda env create --name <venv_name> --file environment.yml
$ conda activte <venv_name>
```
******************
- Using pip:

`$ virtualenv venv`<br>
`$ source /venv/bin/activate` [Linux]<br>
`$ .\venv\Scripts\activate` [Windows]


Note:  If the `virtualenv` command fails, you need to install it globally with pip.

```
$ pip install virtualenv
```

After activating the project virtual environment, install project dependencies.

```
$ pip install -r requirements.txt
```
*********************

Now set up the client side

```
$ cd frontend
$ npm install
```

## Production [Recommended]

1. In the frontend directory: ```npm run build```
2. After the build finishes: In the root directory: ```python run_project.py```
3. Go to [http://localhost:5000/](http://localhost:5000/)

## Development

1. In the frontend directory: ```npm start```
2. In a separate terminal, in the root directory: ```python run_project.py```
3. Go to [http://localhost:3000/](http://localhost:3000/)
