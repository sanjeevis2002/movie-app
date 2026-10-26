package com.example.tamilstream.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.tamilstream.data.model.Channel
import com.example.tamilstream.data.model.Movie
import com.example.tamilstream.data.model.SubscriptionPlan
import com.example.tamilstream.ui.theme.*

@Composable
fun EditChannelDialog(
    channelToEdit: Channel?,
    onDismiss: () -> Unit,
    onSave: (Channel) -> Unit
) {
    var name by remember { mutableStateOf(channelToEdit?.cleanName ?: "") }
    var group by remember { mutableStateOf(channelToEdit?.group ?: "News") }
    var resolution by remember { mutableStateOf(channelToEdit?.resolution ?: "1080P") }
    var logoUrl by remember { mutableStateOf(channelToEdit?.logo ?: "") }
    var streamUrl by remember { mutableStateOf(channelToEdit?.url ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (channelToEdit == null) "Add Custom Channel" else "Edit Channel",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Channel Name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("edit_channel_name_input")
                )
                OutlinedTextField(
                    value = streamUrl,
                    onValueChange = { streamUrl = it },
                    label = { Text("M3U8 / HLS Stream URL") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("edit_channel_url_input")
                )
                OutlinedTextField(
                    value = logoUrl,
                    onValueChange = { logoUrl = it },
                    label = { Text("Channel Logo URL") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = group,
                        onValueChange = { group = it },
                        label = { Text("Category") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = resolution,
                        onValueChange = { resolution = it },
                        label = { Text("Resolution") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank() && streamUrl.isNotBlank()) {
                        val ch = Channel(
                            id = channelToEdit?.id ?: "custom_${System.currentTimeMillis()}",
                            name = name,
                            cleanName = name,
                            group = group,
                            resolution = resolution,
                            logo = if (logoUrl.isNotBlank()) logoUrl else "https://jiotvimages.cdn.jio.com/dare_images/images/aryatvtamil.png",
                            url = streamUrl,
                            isCustom = true
                        )
                        onSave(ch)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = ObsidianBlack),
                modifier = Modifier.testTag("save_channel_confirm_btn")
            ) {
                Text("Save Channel")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = DarkSurface
    )
}

@Composable
fun AdminLoginDialog(
    onDismiss: () -> Unit,
    onLogin: (String) -> Boolean
) {
    var pin by remember { mutableStateOf("") }
    var error by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Lock, contentDescription = "Lock", tint = Amber500)
                Text(
                    text = "Admin Access Portal",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Please enter administrator security credentials or PIN code to enter the control center.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
                OutlinedTextField(
                    value = pin,
                    onValueChange = {
                        pin = it
                        error = false
                    },
                    label = { Text("Admin PIN (e.g. 1234 or admin123)") },
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                    isError = error,
                    modifier = Modifier.fillMaxWidth().testTag("admin_pin_input")
                )
                if (error) {
                    Text(
                        text = "Invalid credential. Try 1234 or admin123",
                        color = LiveRed,
                        fontSize = 12.sp
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val success = onLogin(pin)
                    if (!success) error = true
                },
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = ObsidianBlack),
                modifier = Modifier.testTag("admin_login_submit_btn")
            ) {
                Text("Authenticate")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = DarkSurface
    )
}

@Composable
fun CheckoutDialog(
    plan: SubscriptionPlan,
    onDismiss: () -> Unit,
    onConfirmPayment: () -> Unit
) {
    var selectedMethod by remember { mutableStateOf("UPI") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.WorkspacePremium, contentDescription = "VIP", tint = Amber500)
                Text(
                    text = "Checkout - ${plan.name}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Surface(
                    color = DarkSurfaceElevated,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Amount Due", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                            Text(text = "₹${plan.priceInr} INR", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Black, color = Amber500)
                        }
                        Text(text = plan.billingPeriodLabel, style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                    }
                }

                Text(text = "Payment Method:", style = MaterialTheme.typography.bodyMedium, color = TextPrimary)

                listOf("UPI (GPay / PhonePe / Paytm)", "Credit / Debit Card", "Net Banking").forEach { method ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        RadioButton(
                            selected = selectedMethod == method,
                            onClick = { selectedMethod = method },
                            colors = RadioButtonDefaults.colors(selectedColor = Amber500)
                        )
                        Text(
                            text = method,
                            style = MaterialTheme.typography.bodySmall,
                            color = TextPrimary
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onConfirmPayment,
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = ObsidianBlack),
                modifier = Modifier.testTag("checkout_confirm_pay_btn")
            ) {
                Text("Pay ₹${plan.priceInr} & Activate")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = DarkSurface
    )
}

@Composable
fun PremiumLockAlert(
    movie: Movie,
    onDismiss: () -> Unit,
    onUpgrade: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.WorkspacePremium, contentDescription = "VIP", tint = Amber500)
                Text(
                    text = "VIP Exclusive Content",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "\"${movie.title}\" is part of the TamilStream VIP Catalog.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextPrimary
                )
                Text(
                    text = "Upgrade to TamilStream Premium to enjoy 4K Ultra HD ad-free playback across all your devices.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onUpgrade,
                colors = ButtonDefaults.buttonColors(containerColor = Amber500, contentColor = ObsidianBlack),
                modifier = Modifier.testTag("premium_alert_upgrade_btn")
            ) {
                Text("View VIP Passes")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Maybe Later", color = TextSecondary)
            }
        },
        containerColor = DarkSurface
    )
}
