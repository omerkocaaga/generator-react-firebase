import React<% if (!includeRedux) { %>, { useState }<% } %> from 'react'
import PropTypes from 'prop-types'<% if (includeRedux) { %>
import { Field } from 'redux-form'<% } %><% if (!includeRedux) { %>
import { useFirebaseApp } from 'reactfire'<% } %>
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'<% if (includeRedux) { %>
import TextField from 'components/FormTextField'<% } %>
<% if (!includeRedux) { %>import TextField from '@material-ui/core/TextField'<% } if (includeRedux) { %>import { required, validateEmail } from 'utils/form'<% } %>
import styles from './SignupForm.styles'

const useStyles = makeStyles(styles)

<% if (includeRedux) { %>function SignupForm({ pristine, submitting, handleSubmit }) {
  const classes = useStyles()

  return (
    <form className={classes.root} onSubmit={handleSubmit}>
      <Field
        name="username"
        component={TextField}
        autoComplete="username"
        label="Username"
        validate={required}
      />
      <Field
        name="email"
        component={TextField}
        autoComplete="email"
        label="Email"
        validate={[required, validateEmail]}
      />
      <Field
        name="password"
        component={TextField}
        autoComplete="current-password"
        label="Password"
        type="password"
        validate={required}
      />
      <div className={classes.submit}>
        <Button
          color="primary"
          type="submit"
          variant="contained"
          disabled={pristine || submitting}>
          {submitting ? 'Loading' : 'Sign Up'}
        </Button>
      </div>
    </form>
  )
}

SignupForm.propTypes = {
  pristine: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  submitting: PropTypes.bool.isRequired, // from enhancer (reduxForm)
  handleSubmit: PropTypes.func.isRequired // from enhancer (reduxForm - calls onSubmit)
}

export default SignupForm<% } %><% if (!includeRedux) { %>function SignupForm({ handleSubmit }) {
  const classes = useStyles()
  const firebaseApp = useFirebaseApp()
  const [username, changeUsernameValue] = useState(null)
  const [email, changeEmailValue] = useState(null)
  const [password, changePasswordValue] = useState(null)
  const [submitting, changeSubmittingValue] = useState(false)

  function signup() {
    changeSubmittingValue(true)
    return firebaseApp
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        changeSubmittingValue(false)
      })
  }

  return (
    <form className={classes.container} onSubmit={handleSubmit}>
      <div>
        <TextField
          floatingLabelText="Username"
          value={username}
          onChange={e => changeUsernameValue(e.target.value)}
        />
      </div>
      <div>
        <TextField
          hintText="someone@email.com"
          floatingLabelText="Email"
          value={email}
          onChange={e => changeEmailValue(e.target.value)}
        />
      </div>
      <div>
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => changePasswordValue(e.target.value)}
        />
      </div>
      <Button color="primary" type="submit" onClick={signup}>
        {submitting ? 'Saving' : 'Signup'}
      </Button>
    </form>
  )
}

SignupForm.propTypes = {
  handleSubmit: PropTypes.func
}

export default SignupForm<% } %>
