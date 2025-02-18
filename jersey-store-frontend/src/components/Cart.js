import { CURRENCY } from '../utils/constants';

// ... in your price displays
<Typography variant="body1">
    {CURRENCY.symbol}{(price * quantity).toFixed(2)}
</Typography>

<Typography variant="h6">
    Total: {CURRENCY.symbol}{total.toFixed(2)}
</Typography> 