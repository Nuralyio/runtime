import { css } from "lit";

export default css`
    .collection_viewer {
        min-width: 200px;
        max-height: 200px;
        display: flex;
        flex-wrap: wrap;
    }

    .vertical {
        flex-direction: column;
        flex-wrap: nowrap
        
    }
`;