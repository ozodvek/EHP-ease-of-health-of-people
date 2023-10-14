import React from 'react';
import PropTypes from 'prop-types';
import WizardLayout from './WizardLayout';
import AuthWizardProvider from './AuthWizardProvider';

const Wizard = ({ variant, validation, progressBar }) => {
  return (
    <AuthWizardProvider>
      <WizardLayout
        variant={variant}
        validation={validation}
        progressBar={progressBar}
      />
    </AuthWizardProvider>
  );
};

Wizard.propTypes = {
  variant: PropTypes.oneOf(['pills']),
  validation: PropTypes.bool,
  progressBar: PropTypes.bool
};

export default Wizard;



//
import React, { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

const CustomDateInput = forwardRef(
  (
    { value, onClick, isInvalid, isValid, formControlProps, errorMessage },
    ref
  ) => {
    return (
      <>
        <Form.Control
          ref={ref}
          isInvalid={isInvalid}
          isValid={isValid}
          value={value}
          onClick={onClick}
          {...formControlProps}
        />
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      </>
    );
  }
);

const WizardInput = ({
  label,
  name,
  errors,
  type = 'text',
  options = [],
  placeholder,
  formControlProps,
  formGroupProps,
  setValue,
  datepickerProps
}) => {
  const [date, setDate] = useState(null);

  if (type === 'date') {
    return (
      <Form.Group {...formGroupProps}>
        {!!label && <Form.Label>{label}</Form.Label>}

        <DatePicker
          selected={date}
          onChange={date => {
            setDate(date);
            setValue(name, date);
          }}
          customInput={
            <CustomDateInput
              formControlProps={formControlProps}
              errorMessage={errors[name]?.message}
              isInvalid={errors[name]}
              isValid={Object.keys(errors).length > 0 && !errors[name]}
            />
          }
          {...datepickerProps}
        />
      </Form.Group>
    );
  }

  if (type === 'checkbox' || type === 'switch' || type === 'radio') {
    return (
      <Form.Check type={type} id={name + Math.floor(Math.random() * 100)}>
        <Form.Check.Input
          type={type}
          {...formControlProps}
          isInvalid={errors[name]}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
        />
        <Form.Check.Label className="ms-2">{label}</Form.Check.Label>
        <Form.Control.Feedback type="invalid" className="mt-0">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Check>
    );
  }
  if (type === 'select') {
    return (
      <Form.Group {...formGroupProps}>
        <Form.Label>{label}</Form.Label>
        <Form.Select
          type={type}
          {...formControlProps}
          isInvalid={errors[name]}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }
  if (type === 'textarea') {
    return (
      <Form.Group {...formGroupProps}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          as="textarea"
          placeholder={placeholder}
          {...formControlProps}
          isValid={Object.keys(errors).length > 0 && !errors[name]}
          isInvalid={errors[name]}
          rows={4}
        />
        <Form.Control.Feedback type="invalid">
          {errors[name]?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  }
  return (
    <Form.Group {...formGroupProps}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        placeholder={placeholder}
        {...formControlProps}
        isInvalid={errors[name]}
        isValid={Object.keys(errors).length > 0 && !errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {errors[name]?.message}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

CustomDateInput.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.func,
  isInvalid: PropTypes.bool,
  isValid: PropTypes.bool,
  formControlProps: PropTypes.object,
  errorMessage: PropTypes.string
};

WizardInput.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string.isRequired,
  errors: PropTypes.object,
  type: PropTypes.string,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  formControlProps: PropTypes.object,
  formGroupProps: PropTypes.object,
  setValue: PropTypes.func,
  datepickerProps: PropTypes.object
};

WizardInput.defaultProps = { required: false };

export default WizardInput;

//




import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Form, Nav, ProgressBar } from 'react-bootstrap';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm } from 'react-hook-form';
import AccountForm from './AccountForm';
import PersonalForm from './PersonalForm';
import BillingForm from './BillingForm';
import Success from './Success';
import AppContext, { AuthWizardContext } from 'context/Context';
import IconButton from 'components/common/IconButton';
import WizardModal from './WizardModal';
import Flex from 'components/common/Flex';

const WizardLayout = ({ variant, validation, progressBar }) => {
  const { isRTL } = useContext(AppContext);
  const { user, setUser, step, setStep } = useContext(AuthWizardContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    clearErrors
  } = useForm();

  const [modal, setModal] = useState(false);

  const navItems = [
    {
      icon: 'lock',
      label: 'Account'
    },
    {
      icon: 'user',
      label: 'Personal'
    },
    {
      icon: 'dollar-sign',
      label: 'Billing'
    },
    {
      icon: 'thumbs-up',
      label: 'Done'
    }
  ];

  const onSubmitData = data => {
    setUser({ ...user, ...data });
    setStep(step + 1);
  };
  const onError = () => {
    if (!validation) {
      clearErrors();
      setStep(step + 1);
    }
  };

  const toggle = () => setModal(!modal);

  const handleNavs = targetStep => {
    if (step !== 4) {
      if (targetStep < step) {
        setStep(targetStep);
      } else {
        handleSubmit(onSubmitData, onError)();
      }
    } else {
      toggle();
    }
  };

  return (
    <>
      <WizardModal modal={modal} setModal={setModal} />
      <Card
        as={Form}
        noValidate
        onSubmit={handleSubmit(onSubmitData, onError)}
        className="theme-wizard mb-5"
      >
        <Card.Header
          className={classNames('bg-light', {
            'px-4 py-3': variant === 'pills',
            'pb-2': !variant
          })}
        >
          <Nav className="justify-content-center" variant={variant}>
            {variant === 'pills'
              ? navItems.map((item, index) => (
                  <NavItemPill
                    key={item.label}
                    index={index + 1}
                    step={step}
                    handleNavs={handleNavs}
                    icon={item.icon}
                    label={item.label}
                  />
                ))
              : navItems.map((item, index) => (
                  <NavItem
                    key={item.label}
                    index={index + 1}
                    step={step}
                    handleNavs={handleNavs}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
          </Nav>
        </Card.Header>
        {progressBar && <ProgressBar now={step * 25} style={{ height: 2 }} />}
        <Card.Body className="fw-normal px-md-6 py-4">
          {step === 1 && (
            <AccountForm register={register} errors={errors} watch={watch} />
          )}
          {step === 2 && (
            <PersonalForm
              register={register}
              errors={errors}
              setValue={setValue}
            />
          )}
          {step === 3 && (
            <BillingForm
              register={register}
              errors={errors}
              setValue={setValue}
            />
          )}
          {step === 4 && <Success reset={reset} />}
        </Card.Body>
        <Card.Footer
          className={classNames('px-md-6 bg-light', {
            'd-none': step === 4,
            ' d-flex': step < 4
          })}
        >
          <IconButton
            variant="link"
            icon={isRTL ? 'chevron-right' : 'chevron-left'}
            iconAlign="left"
            transform="down-1 shrink-4"
            className={classNames('px-0 fw-semi-bold', {
              'd-none': step === 1
            })}
            onClick={() => {
              setStep(step - 1);
            }}
          >
            Prev
          </IconButton>

          <IconButton
            variant="primary"
            className="ms-auto px-5"
            type="submit"
            icon={isRTL ? 'chevron-left' : 'chevron-right'}
            iconAlign="right"
            transform="down-1 shrink-4"
          >
            Next
          </IconButton>
        </Card.Footer>
      </Card>
    </>
  );
};

const NavItem = ({ index, step, handleNavs, icon, label }) => {
  return (
    <Nav.Item>
      <Nav.Link
        className={classNames('fw-semi-bold', {
          done: index < 4 ? step > index : step > 3,
          active: step === index
        })}
        onClick={() => handleNavs(index)}
      >
        <span className="nav-item-circle-parent">
          <span className="nav-item-circle">
            <FontAwesomeIcon icon={icon} />
          </span>
        </span>
        <span className="d-none d-md-block mt-1 fs--1">{label}</span>
      </Nav.Link>
    </Nav.Item>
  );
};

const NavItemPill = ({ index, step, handleNavs, icon, label }) => {
  return (
    <Nav.Item>
      <Nav.Link
        className={classNames('fw-semi-bold', {
          done: step > index,
          active: step === index
        })}
        onClick={() => handleNavs(index)}
      >
        <Flex alignItems="center" justifyContent="center">
          <FontAwesomeIcon icon={icon} />
          <span className="d-none d-md-block mt-1 fs--1 ms-2">{label}</span>
        </Flex>
      </Nav.Link>
    </Nav.Item>
  );
};

WizardLayout.propTypes = {
  variant: PropTypes.oneOf(['pills']),
  validation: PropTypes.bool,
  progressBar: PropTypes.bool
};

NavItemPill.propTypes = {
  index: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  handleNavs: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

NavItem.propTypes = NavItemPill.propTypes;

export default WizardLayout;



//



import FalconCloseButton from 'components/common/FalconCloseButton';
import Flex from 'components/common/Flex';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal } from 'react-bootstrap';
import animationData from './lottie/warning-light.json';

const WizardModal = ({ modal, setModal }) => {
  return (
    <Modal show={modal} centered dialogClassName="wizard-modal">
      <Modal.Body className="p-4">
        <FalconCloseButton
          size="sm"
          className="position-absolute top-0 end-0 me-2 mt-2"
          onClick={() => setModal(!modal)}
        />
        <Flex justifyContent="center" alignItems="center">
          <Lottie
            animationData={animationData}
            loop={true}
            style={{ width: '100px' }}
          />
          <p className="mb-0 flex-1">
            You don't have access to <br />
            the link. Please try again.
          </p>
        </Flex>
      </Modal.Body>
    </Modal>
  );
};

WizardModal.propTypes = {
  modal: PropTypes.bool.isRequired,
  setModal: PropTypes.func.isRequired
};

export default WizardModal;
//



import { AuthWizardContext } from 'context/Context';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import celebration from './lottie/celebration.json';

const Success = ({ reset }) => {
  const { setStep, setUser } = useContext(AuthWizardContext);

  const emptyData = () => {
    setStep(1);
    setUser({});
    reset();
  };

  return (
    <>
      <Row>
        <Col className="text-center">
          <div className="wizard-lottie-wrapper">
            <div className="wizard-lottie mx-auto">
              <Lottie animationData={celebration} loop={true} />
            </div>
          </div>
          <h4 className="mb-1">Your account is all set!</h4>
          <p className="fs-0">Now you can access to your account</p>
          <Button color="primary" className="px-5 my-3" onClick={emptyData}>
            Start Over
          </Button>
        </Col>
      </Row>
    </>
  );
};

Success.propTypes = {
  reset: PropTypes.func.isRequired
};

export default Success;




import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import WizardInput from './WizardInput';
import FalconDropzone from 'components/common/FalconDropzone';
import avatarImg from 'assets/img/team/avatar.png';
import { isIterableArray } from 'helpers/utils';
import Avatar from 'components/common/Avatar';
import cloudUpload from 'assets/img/icons/cloud-upload.svg';
import { AuthWizardContext } from 'context/Context';
import Flex from 'components/common/Flex';
import { Col, Row } from 'react-bootstrap';

const PersonalForm = ({ register, errors, setValue }) => {
  const { user } = useContext(AuthWizardContext);
  const [avatar, setAvatar] = useState([
    ...(user.avater ? user.avater : []),
    { src: avatarImg }
  ]);

  return (
    <>
      <Row className="mb-3">
        <Col md="auto">
          <Avatar
            size="4xl"
            src={
              isIterableArray(avatar) ? avatar[0]?.base64 || avatar[0]?.src : ''
            }
          />
        </Col>
        <Col md>
          <FalconDropzone
            files={avatar}
            onChange={files => {
              setAvatar(files);
              setValue('avatar', files);
            }}
            multiple={false}
            accept="image/*"
            placeholder={
              <>
                <Flex justifyContent="center">
                  <img src={cloudUpload} alt="" width={25} className="me-2" />
                  <p className="fs-0 mb-0 text-700">
                    Upload your profile picture
                  </p>
                </Flex>
                <p className="mb-0 w-75 mx-auto text-400">
                  Upload a 300x300 jpg image with a maximum size of 400KB
                </p>
              </>
            }
          />
        </Col>
      </Row>

      <WizardInput
        type="select"
        label="Gender"
        name="gender"
        placeholder="Select your gender..."
        errors={errors}
        options={['Male', 'Female', 'Other']}
        formGroupProps={{
          className: 'mb-3'
        }}
        formControlProps={{
          ...register('gender')
        }}
      />

      <WizardInput
        type="number"
        label="Phone"
        name="phone"
        errors={errors}
        formGroupProps={{
          className: 'mb-3'
        }}
        formControlProps={{
          className: 'input-spin-none',
          ...register('phone')
        }}
      />

      <WizardInput
        type="date"
        label="Date of Birth"
        name="birthDate"
        errors={errors}
        setValue={setValue}
        formGroupProps={{
          className: 'mb-3'
        }}
        formControlProps={{
          placeholder: 'Date of Birth',
          ...register('birthDate')
        }}
      />

      <WizardInput
        type="textarea"
        label="Address"
        name="address"
        errors={errors}
        formGroupProps={{
          className: 'mb-3'
        }}
        formControlProps={{
          ...register('address')
        }}
      />
    </>
  );
};

PersonalForm.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  setValue: PropTypes.func.isRequired
};

export default PersonalForm;



import React from 'react';
import PropTypes from 'prop-types';
import WizardInput from './WizardInput';
import { Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const BillingUserForm = ({ register, errors, setValue }) => {
  return (
    <>
      <Row className="g-2 mb-3">
        <WizardInput
          type="number"
          errors={errors}
          label="Card Number *"
          name="cardNumber"
          placeholder="•••• •••• •••• ••••"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            className: 'input-spin-none',
            ...register('cardNumber', {
              required: 'Please Enter your card number'
            })
          }}
        />
        <WizardInput
          errors={errors}
          label="Name on Card*"
          name="nameOnCard"
          placeholder="John Doe"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('nameOnCard', {
              required: 'Name on card is requred'
            })
          }}
        />
      </Row>

      <Row className="g-2 mb-3">
        <WizardInput
          type="select"
          name="country"
          label="Country"
          errors={errors}
          placeholder="Select your country"
          options={[
            'Afghanistan',
            'Albania',
            'Algeria',
            'American Samoa',
            'Andorra',
            'Angola',
            'Anguilla',
            'Antarctica',
            'Antigua and Barbuda',
            'Argentina',
            'Armenia',
            'Aruba',
            'Australia',
            'Austria',
            'Azerbaijan',
            'Bahamas',
            'Bahrain',
            'Bangladesh',
            'Barbados',
            'Belarus',
            'Belgium',
            'Belize',
            'Benin',
            'Bermuda',
            'Bhutan',
            'Bolivia',
            'Bosnia and Herzegowina',
            'Botswana',
            'Bouvet Island',
            'Brazil',
            'British Indian Ocean Territory',
            'Brunei Darussalam',
            'Bulgaria',
            'Burkina Faso',
            'Burundi',
            'Cambodia',
            'Cameroon',
            'Canada',
            'Cape Verde',
            'Cayman Islands',
            'Central African Republic',
            'Chad',
            'Chile',
            'China',
            'Christmas Island',
            'Cocos (Keeling) Islands',
            'Colombia',
            'Comoros',
            'Congo',
            'Congo, the Democratic Republic of the',
            'Cook Islands',
            'Costa Rica',
            "Cote d'Ivoire",
            'Croatia (Hrvatska)',
            'Cuba',
            'Cyprus',
            'Czech Republic',
            'Denmark',
            'Djibouti',
            'Dominica',
            'Dominican Republic',
            'East Timor',
            'Ecuador',
            'Egypt',
            'El Salvador',
            'Equatorial Guinea',
            'Eritrea',
            'Estonia',
            'Ethiopia',
            'Falkland Islands (Malvinas)',
            'Faroe Islands',
            'Fiji',
            'Finland',
            'France',
            'France Metropolitan',
            'French Guiana',
            'French Polynesia',
            'French Southern Territories',
            'Gabon',
            'Gambia',
            'Georgia',
            'Germany',
            'Ghana',
            'Gibraltar',
            'Greece',
            'Greenland',
            'Grenada',
            'Guadeloupe',
            'Guam',
            'Guatemala',
            'Guinea',
            'Guinea-Bissau',
            'Guyana',
            'Haiti',
            'Heard and Mc Donald Islands',
            'Holy See (Vatican City State)',
            'Honduras',
            'Hong Kong',
            'Hungary',
            'Iceland',
            'India',
            'Indonesia',
            'Iran (Islamic Republic of)',
            'Iraq',
            'Ireland',
            'Israel',
            'Italy',
            'Jamaica',
            'Japan',
            'Jordan',
            'Kazakhstan',
            'Kenya',
            'Kiribati',
            "Korea, Democratic People's Republic of",
            'Korea, Republic of',
            'Kuwait',
            'Kyrgyzstan',
            "Lao, People's Democratic Republic",
            'Latvia',
            'Lebanon',
            'Lesotho',
            'Liberia',
            'Libyan Arab Jamahiriya',
            'Liechtenstein',
            'Lithuania',
            'Luxembourg',
            'Macau',
            'Macedonia, The Former Yugoslav Republic of',
            'Madagascar',
            'Malawi',
            'Malaysia',
            'Maldives',
            'Mali',
            'Malta',
            'Marshall Islands',
            'Martinique',
            'Mauritania',
            'Mauritius',
            'Mayotte',
            'Mexico',
            'Micronesia, Federated States of',
            'Moldova, Republic of',
            'Monaco',
            'Mongolia',
            'Montserrat',
            'Morocco',
            'Mozambique',
            'Myanmar',
            'Namibia',
            'Nauru',
            'Nepal',
            'Netherlands',
            'Netherlands Antilles',
            'New Caledonia',
            'New Zealand',
            'Nicaragua',
            'Niger',
            'Nigeria',
            'Niue',
            'Norfolk Island',
            'Northern Mariana Islands',
            'Norway',
            'Oman',
            'Pakistan',
            'Palau',
            'Panama',
            'Papua New Guinea',
            'Paraguay',
            'Peru',
            'Philippines',
            'Pitcairn',
            'Poland',
            'Portugal',
            'Puerto Rico',
            'Qatar',
            'Reunion',
            'Romania',
            'Russian Federation',
            'Rwanda',
            'Saint Kitts and Nevis',
            'Saint Lucia',
            'Saint Vincent and the Grenadines',
            'Samoa',
            'San Marino',
            'Sao Tome and Principe',
            'Saudi Arabia',
            'Senegal',
            'Seychelles',
            'Sierra Leone',
            'Singapore',
            'Slovakia (Slovak Republic)',
            'Slovenia',
            'Solomon Islands',
            'Somalia',
            'South Africa',
            'South Georgia and the South Sandwich Islands',
            'Spain',
            'Sri Lanka',
            'St. Helena',
            'St. Pierre and Miquelon',
            'Sudan',
            'Suriname',
            'Svalbard and Jan Mayen Islands',
            'Swaziland',
            'Sweden',
            'Switzerland',
            'Syrian Arab Republic',
            'Taiwan, Province of China',
            'Tajikistan',
            'Tanzania, United Republic of',
            'Thailand',
            'Togo',
            'Tokelau',
            'Tonga',
            'Trinidad and Tobago',
            'Tunisia',
            'Turkey',
            'Turkmenistan',
            'Turks and Caicos Islands',
            'Tuvalu',
            'Uganda',
            'Ukraine',
            'United Arab Emirates',
            'United Kingdom',
            'United States',
            'United States Minor Outlying Islands',
            'Uruguay',
            'Uzbekistan',
            'Vanuatu',
            'Venezuela',
            'Vietnam',
            'Virgin Islands (British)',
            'Virgin Islands (U.S.)',
            'Wallis and Futuna Islands',
            'Western Sahara',
            'Yemen',
            'Yugoslavia',
            'Zambia',
            'Zimbabwe'
          ]}
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('country', {
              required: 'Select a country'
            })
          }}
        />

        <WizardInput
          type="number"
          name="zipCode"
          label="Zip Code*"
          placeholder="1234"
          errors={errors}
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            className: 'input-spin-none',
            ...register('zipCode', {
              required: 'Zip code is requred'
            })
          }}
        />
      </Row>

      <Row className="g-2 mb-3">
        <WizardInput
          label="Exp Date*"
          type="date"
          name="expDate"
          setValue={setValue}
          errors={errors}
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            placeholder: 'MM/YYYY',
            ...register('expDate', {
              required: 'Exp date is requred.'
            })
          }}
          datepickerProps={{
            dateFormat: 'MM/yyyy',
            showMonthYearPicker: true
          }}
        />
        <WizardInput
          label={
            <>
              CVV*
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip style={{ position: 'fixed' }}>
                    Card verification value
                  </Tooltip>
                }
              >
                <span>
                  <FontAwesomeIcon icon="question-circle" className="mx-2" />
                </span>
              </OverlayTrigger>
            </>
          }
          type="number"
          name="cvv"
          placeholder="123"
          errors={errors}
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            className: 'input-spin-none',
            ...register('cvv', {
              required: 'CVV is requred',
              maxLength: {
                value: 3,
                message: 'cvv must have at max 3 characters'
              }
            })
          }}
        />
      </Row>
    </>
  );
};

BillingUserForm.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  setValue: PropTypes.func.isRequired
};

export default BillingUserForm;





import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AuthWizardContext } from 'context/Context';

const AuthWizardProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [step, setStep] = useState(1);

  const value = { user, setUser, step, setStep };
  return (
    <AuthWizardContext.Provider value={value}>
      {children}
    </AuthWizardContext.Provider>
  );
};

AuthWizardProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthWizardProvider;




import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import WizardInput from './WizardInput';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AccountForm = ({ register, errors, watch }) => {
  return (
    <>
      <WizardInput
        label="Name"
        name="name"
        errors={errors}
        formGroupProps={{ className: 'mb-3' }}
        formControlProps={{
          ...register('name')
        }}
      />

      <WizardInput
        type="email"
        errors={errors}
        label="Email*"
        name="email"
        formGroupProps={{ className: 'mb-3' }}
        formControlProps={{
          ...register('email', {
            required: 'Email field is required',
            pattern: {
              value:
                /[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/i,
              message: 'Email must be valid'
            }
          })
        }}
      />

      <Row className="g-2 mb-3">
        <WizardInput
          type="password"
          errors={errors}
          label="Password*"
          name="password"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('password', {
              required: 'You must specify a password',
              minLength: {
                value: 2,
                message: 'Password must have at least 2 characters'
              }
            })
          }}
        />
        <WizardInput
          type="password"
          errors={errors}
          label="Confirm Password*"
          name="confirmPassword"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('confirmPassword', {
              required: 'Confirm Password field is required',
              validate: value =>
                value === watch('password') || 'The password do not match'
            })
          }}
        />
      </Row>

      <WizardInput
        type="checkbox"
        errors={errors}
        label={
          <>
            I accept the <Link to="#!"> terms</Link> and{' '}
            <Link to="#!"> privacy policy</Link>
          </>
        }
        name="agreedToTerms"
        formControlProps={{
          ...register('agreedToTerms', {
            required: 'You need to agree the terms and privacy policy.'
          })
        }}
      />
    </>
  );
};

AccountForm.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.object,
  watch: PropTypes.func
};

export default AccountForm;
