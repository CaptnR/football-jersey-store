<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h6">
        {item.player?.name} Jersey
    </Typography>
    <Typography variant="h6" color="primary">
        ₹{(item.price * item.quantity).toFixed(2)}
    </Typography>
</Box>

<Typography color="text.secondary">
    ₹{item.price} each
</Typography> 