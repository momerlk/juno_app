// Function to validate email
export function validateEmail(email: string): { ok: boolean, message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return { ok: false, message: "Email is required." };
    } else if (!emailRegex.test(email)) {
        return { ok: false, message: "Invalid email format." };
    }
    return { ok: true, message: "Valid email." };
}

// Function to validate phone number with country code
export function validatePhoneNumber(phone: string): { ok: boolean, message: string } {
    const phoneRegex = /^\+[1-9]{1}[0-9]{1,14}$/; // Basic international format check
    if (!phone) {
        return { ok: false, message: "Phone number is required." };
    } else if (!phoneRegex.test(phone)) {
        return { ok: false, message: "Invalid phone number format. Include country code." };
    }
    return { ok: true, message: "Valid phone number." };
}

// Function to validate password
export function validatePassword(password: string): { ok: boolean, message: string } {
    const minLength = 8;
    const numberRegex = /[0-9]/;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    
    if (!password) {
        return { ok: false, message: "Password is required." };
    } else if (password.length < minLength) {
        return { ok: false, message: `Password must be at least ${minLength} characters long.` };
    } else if (!numberRegex.test(password)) {
        return { ok: false, message: "Password must contain at least one number." };
    } else if (!symbolRegex.test(password)) {
        return { ok: false, message: "Password must contain at least one symbol." };
    }
    return { ok: true, message: "Valid password." };
}


interface LocationValidationResult {
    ok: boolean;
    message: string;
    city?: string;
    state?: string;
    country?: string;
}

export function validateLocation(location: string): LocationValidationResult {
    if (!location) {
        return { ok: false, message: "Location is required." };
    }

    // Split the location into parts
    const parts = location.split(',').map(part => part.trim());

    if (parts.length !== 3) {
        return { ok: false, message: "Location must include city, state, and country." };
    }

    const [city, state, country] = parts;

    if (!city) {
        return { ok: false, message: "City is required." };
    }
    if (!state) {
        return { ok: false, message: "State is required." };
    }
    if (!country) {
        return { ok: false, message: "Country is required." };
    }

    return {
        ok: true,
        message: "Valid location.",
        city: city.toLowerCase(),
        state: state.toLowerCase(),
        country: country.toLowerCase()
    };
}