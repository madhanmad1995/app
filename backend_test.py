import requests
import sys
import json
from datetime import datetime, timezone
import uuid

class AttendanceAPITester:
    def __init__(self, base_url="https://wage-tracker-16.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_worker_id = None
        self.test_worker_uuid = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_create_worker(self):
        """Test creating a new worker"""
        test_id = f"TEST{datetime.now().strftime('%H%M%S')}"
        worker_data = {
            "name": "Test Worker",
            "worker_id": test_id,
            "daily_wage_rate": 500.0
        }
        
        success, response = self.run_test(
            "Create Worker",
            "POST",
            "workers",
            200,
            data=worker_data
        )
        
        if success and 'id' in response:
            self.test_worker_uuid = response['id']
            self.test_worker_id = test_id
            print(f"   Created worker with UUID: {self.test_worker_uuid}")
            return True
        return False

    def test_get_workers(self):
        """Test getting all workers"""
        success, response = self.run_test(
            "Get All Workers",
            "GET",
            "workers",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} workers")
            return True
        return False

    def test_get_worker_by_id(self):
        """Test getting a specific worker"""
        if not self.test_worker_uuid:
            print("❌ Skipping - No test worker UUID available")
            return False
            
        success, response = self.run_test(
            "Get Worker by ID",
            "GET",
            f"workers/{self.test_worker_uuid}",
            200
        )
        
        if success and response.get('id') == self.test_worker_uuid:
            print(f"   Retrieved worker: {response.get('name')}")
            return True
        return False

    def test_update_worker(self):
        """Test updating a worker"""
        if not self.test_worker_uuid:
            print("❌ Skipping - No test worker UUID available")
            return False
            
        update_data = {
            "name": "Updated Test Worker",
            "daily_wage_rate": 600.0
        }
        
        success, response = self.run_test(
            "Update Worker",
            "PUT",
            f"workers/{self.test_worker_uuid}",
            200,
            data=update_data
        )
        
        if success and response.get('name') == "Updated Test Worker":
            print(f"   Updated worker name to: {response.get('name')}")
            return True
        return False

    def test_mark_attendance(self):
        """Test marking attendance for a worker"""
        if not self.test_worker_uuid:
            print("❌ Skipping - No test worker UUID available")
            return False
            
        # Create attendance with clock-in and clock-out times
        today = datetime.now(timezone.utc)
        clock_in = today.replace(hour=9, minute=0, second=0, microsecond=0)
        clock_out = today.replace(hour=17, minute=0, second=0, microsecond=0)
        
        attendance_data = {
            "worker_id": self.test_worker_uuid,
            "clock_in": clock_in.isoformat(),
            "clock_out": clock_out.isoformat()
        }
        
        success, response = self.run_test(
            "Mark Attendance",
            "POST",
            "attendance",
            200,
            data=attendance_data
        )
        
        if success:
            hours = response.get('hours_worked', 0)
            wage = response.get('wage_earned', 0)
            print(f"   Hours worked: {hours}, Wage earned: ₹{wage}")
            return True
        return False

    def test_get_today_attendance(self):
        """Test getting today's attendance"""
        success, response = self.run_test(
            "Get Today's Attendance",
            "GET",
            "attendance/today",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} attendance records for today")
            return True
        return False

    def test_get_attendance_by_date(self):
        """Test getting attendance by specific date"""
        today = datetime.now(timezone.utc).date().isoformat()
        
        success, response = self.run_test(
            "Get Attendance by Date",
            "GET",
            f"attendance/date/{today}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} attendance records for {today}")
            return True
        return False

    def test_get_worker_attendance(self):
        """Test getting attendance for a specific worker"""
        if not self.test_worker_uuid:
            print("❌ Skipping - No test worker UUID available")
            return False
            
        success, response = self.run_test(
            "Get Worker Attendance",
            "GET",
            f"attendance/worker/{self.test_worker_uuid}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} attendance records for worker")
            return True
        return False

    def test_monthly_report(self):
        """Test getting monthly report"""
        now = datetime.now()
        year = now.year
        month = now.month
        
        success, response = self.run_test(
            "Get Monthly Report",
            "GET",
            f"attendance/monthly/{year}/{month}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} workers in monthly report")
            return True
        return False

    def test_dashboard_stats(self):
        """Test getting dashboard statistics"""
        success, response = self.run_test(
            "Get Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        
        if success and 'total_workers' in response:
            stats = response
            print(f"   Total workers: {stats.get('total_workers')}")
            print(f"   Present today: {stats.get('present_today')}")
            print(f"   Total hours today: {stats.get('total_hours_today')}")
            print(f"   Total wages today: ₹{stats.get('total_wages_today')}")
            return True
        return False

    def test_delete_worker(self):
        """Test deleting a worker (cleanup)"""
        if not self.test_worker_uuid:
            print("❌ Skipping - No test worker UUID available")
            return False
            
        success, response = self.run_test(
            "Delete Worker",
            "DELETE",
            f"workers/{self.test_worker_uuid}",
            200
        )
        
        if success:
            print(f"   Deleted test worker successfully")
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Attendance Management API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_create_worker,
            self.test_get_workers,
            self.test_get_worker_by_id,
            self.test_update_worker,
            self.test_mark_attendance,
            self.test_get_today_attendance,
            self.test_get_attendance_by_date,
            self.test_get_worker_attendance,
            self.test_monthly_report,
            self.test_dashboard_stats,
            self.test_delete_worker,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = AttendanceAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())