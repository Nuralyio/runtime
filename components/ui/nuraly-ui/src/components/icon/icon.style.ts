import { css } from "lit";

export default css`
.svg-icon{
	fill: white;
	width: 20px;
    height: 15px;
}
 @media (prefers-color-scheme: dark) {
		.svg-icon{
			fill: black;
		}
	}
`;