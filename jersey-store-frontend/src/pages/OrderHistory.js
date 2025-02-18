import { CURRENCY } from '../utils/constants';

// ... in your price displays
<Typography>
    {CURRENCY.symbol}{order.total_price.toFixed(2)}
</Typography> 