/**
 * @jest-environment jsdom
 */

 import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import mockedStore from "../__mocks__/store"


describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    test("Then NewBill page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
    })
  })

  describe("When I do not fill fields and I click on submit button", () => {
    test("Then I should stay on NewBill page", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({ document, onNavigate, store: mockedStore, localStorage: window.localStorage })
      
      const expenseName = screen.getByTestId("expense-name");
      expect(expenseName.value).toBe("");

      const dateInput = screen.getByTestId("datepicker");
      expect(dateInput.value).toBe("");

      const amountInput = screen.getByTestId("amount");
      expect(amountInput.value).toBe("");

      const vattInput = screen.getByTestId("vat");
      expect(vattInput.value).toBe("");

      const pctInput = screen.getByTestId("pct");
      expect(pctInput.value).toBe("");

      const fileInput = screen.getByTestId("file");
      expect(fileInput.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();

    })
  })

  describe("When I upload the wong file format", () => {
    test("Alert message shoul appear", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({ document, onNavigate, store: mockedStore, localStorage: window.localStorage })
      const spyHandleChangeFile = jest.spyOn(newBill, 'handleChangeFile')
      const inputData = "hello.pdf"
      const fileInput = screen.getByTestId("file")

      window.onNavigate(ROUTES_PATH.NewBill)
      window.alert = jest.fn()

      fileInput.addEventListener('change', newBill.handleChangeFile)
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['hello'],inputData, {type: 'image/pdf'})]
        }
      })


      expect(spyHandleChangeFile).toHaveBeenCalled()
      expect(window.alert).toHaveBeenCalledWith('Seuls des fichiers jpg, jpeg ou png sont acceptés.')

    })
  })

  describe("POST NewBill Test", () => {
    test("should create newbill and navigate to bills page", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
    
      document.body.innerHTML = NewBillUI();

      const fakeBillData = {
        type: 'Transports',
        name: 'train Paris/Lyon',
        date: '20-10-2021',
        amount: '48',
        vat: '4',
        pct: '10',
        commentary: 'Billet 2nd classe',
        filename: 'billet-train',
        fileUrl: 'C:\\fakepath\\billet-train.png'
      };

      const form = screen.getByTestId('form-new-bill');


      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: fakeBillData.type } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: fakeBillData.name } });
      fireEvent.change(screen.getByTestId('datepicker'), { target: { value: fakeBillData.date } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: fakeBillData.amount } });
      fireEvent.change(screen.getByTestId('vat'), { target: { value: fakeBillData.vat } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: fakeBillData.pct } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: fakeBillData.commentary } });

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "NewBill";

      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store: mockedStore,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        
    })
  })

})