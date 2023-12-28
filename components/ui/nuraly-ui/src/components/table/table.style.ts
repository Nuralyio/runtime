import { css } from "lit";

export default css`
 .ico {
	 font-family: 'Material Icons';
	 font-weight: normal;
	 font-style: normal;
	 font-size: 24px;
	 display: inline-block;
	 line-height: 1;
	 text-transform: none;
	 letter-spacing: normal;
	 word-wrap: normal;
	 white-space: nowrap;
	 direction: ltr;
	 -webkit-font-smoothing: antialiased;
	 text-rendering: optimizeLegibility;
	 -moz-osx-font-smoothing: grayscale;
	 font-feature-settings: 'liga';
}


 table {
	 border-collapse: separate;
	 margin-bottom: 20px;
	 border-radius: 8px;
	 border-spacing: 0px;
}
 table thead {
	 border: none;
}
 table thead th {
	 background: #ededed;
	 text-align: left;
	 user-select: none;
	 cursor: pointer;
	 position: relative;
}


 table thead th.active {
	 background: #BBB;
}
 table thead th p {
	 display: inline-block;
	 padding-right: 20px;
	 pointer-events: none;
}
 table thead th i.ico {
	 position: absolute;
	 width: 16px;
	 height: 16px;
	 line-height: 15px;
	 user-select: none;
	 pointer-events: none;
	 right: 12px;
	 top: 9px;
}
 table thead th ul {
	 left: -1px;
	 right: -1px;
	 top: 34px;
	 list-style-type: none;
	 position: absolute;
	 background: #EEE;
	 width: 100%;
	 border: 1px solid grey;
}
 table thead th ul li {
	 padding: 6px 10px;
	 text-align: center;
}
 table thead th ul li:not(.disable):hover {
	 background: lightgrey;
}
 table thead th ul li.disable {
	 opacity: 0.4;
}
 table tr[class^="filter-"] {
	 display: none;
}
table tr {
	border : none
}
 table tr:not(:first-child) {
}
 table tr th, table tr td {
	 font-weight: normal;
	 font-size: 14px;
	 font-family: 'Roboto', sans-serif;
	 padding : 4px;
}
 table tr:hover {
		 background: lightgrey;

}

 table tr th:not(:first-child), table tr td:not(:first-child) {
}

p{
	margin: 1px;
	padding: 1px;

}
table {
    border-collapse:separate;
    border:solid black 1px;
    border-radius:6px;
    width: var(--hy-table-width, auto);
}

td, th {
    border-left:solid black 1px;
    border-top:solid black 1px;
}

th {
    border-top: none;
}

td:first-child, th:first-child {
     border-left: none;
}
.row-edited{
	background-color: rgb(131 118 32);
}
.row-edited:hover{
	background-color: rgb(131 118 32);
}

.active-row{
	background-color: rgb(51 129 237);
}
.active-row:hover{
	background-color: rgb(74 150 255);

}
p:empty {
    height: 20px;
}
 @media (prefers-color-scheme: dark) {
		table thead th {
			color: white;
			 background: #2c2c2c;
		}
		 table tr th{
			 background: #2c2c2c;
			 color: white;
		}

		 table tr {
			 background: rgb(74 74 74);
			 color: white;
		}

		 table tr:hover {
		 background: rgb(103 103 103);
		}




	}
 
`;