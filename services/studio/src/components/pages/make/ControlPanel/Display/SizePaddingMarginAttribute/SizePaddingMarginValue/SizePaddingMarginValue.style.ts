import { css } from "lit";


export default css`
		hy-input {
			--hybrid-input-container-border-color: transparent;
			--hybrid-input-container-padding-top : 0px;
			--hybrid-input-container-padding-bottom : 0px;
			--hybrid-input-container-padding-left : 0px;
			--hybrid-input-container-padding-right : 0px;
			--hybrid-input-text-align:center
		}
		.margin-label, .padding-label{
			color: #ccc;
			margin-bottom: 14px;
		}
		.container-outside {
			width : 210px;
			background-color : #393939;
			padding : 50px;
		    border-radius: 3px;
		    padding-top: 5px;
		    padding-bottom: 35px;
		}

		.position-input{
		    width: 40px;

		}

		.container-outside > .margin-left {
            display: block;
		    margin-left: -44px;
		    height: 50px;
		    margin-top: 41px;
		    position: absolute;
		}

		.container-outside > .margin-right {
            display: block;
		    margin-left: 214px;
		    height: 50px;
		    margin-top: 41px;
		    position: absolute;
		}

		.container-outside > .margin-top {
		    display: block;
		    height: 50px;
		    margin-top: -22px;
		    position: absolute;
		    margin-left: 96px; 
		}


		.container-outside > .margin-bottom {
         	display: block;
		    height: 50px;
		    margin-top: 99px;
		    position: absolute;
		    margin-left: 96px;
		}



		.container {
			display:flex ; height : 100px ;     
			display: flex;
			width : 200px;
			height : 85px;
		    border: 1px solid #bcbcbc;
		    border-radius: 3px;
		    padding: 5px;
		}

		.container > .padding-left {
            display: block;
		    margin-left:-2px;
		    height: 50px;
		    margin-top: 35px;
		    position: absolute;
		}

		.container > .padding-right {
            display: block;
		    margin-left: 162px;
		    height: 50px;
		    margin-top: 35px;
		    position: absolute;
		}

		.container > .padding-top {
		    display: block;
		    height: 50px;
		    margin-top: -2px;
		    position: absolute;
		    margin-left: 90px; 
		}


		.container > .padding-bottom {
         	display: block;
		    margin-top: 70px;
		    position: absolute;
		    margin-left: 90px;
		}

        .input-group {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 300px; /* Adjust the width as needed */
            margin: 10px;
        }

	`	