import { test, expect } from '@playwright/test';

test.describe('Login Flow', ()=>{
    test('should allow all user to login with valid credentials', async ({ page }) => {
        // 1. go to login page
        await page.goto('http://localhost:3000/login');

        //
    })
}

)