import { css } from "lit";

export default css`
    .collection_viewer {
        --columns: 1;
        min-width: 200px;
        max-height: 400px;
        display: flex;
        flex-wrap: wrap; /* Allows items to wrap into new rows */
    }

    .vertical {
        flex-direction: column;
        flex-wrap: nowrap
        
    }

    .collection{
        flex: 0 0 calc(100% / var(--columns) - 10px); /* Fixed width */
    }
`;